import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./plugins/vuetify";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createUploadLink } from "apollo-upload-client";
import { onError } from "apollo-link-error";
import { ApolloLink, Observable } from "apollo-link";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import VueApollo from "vue-apollo";
import Alert from "./components/Alert"

// Register Global Component
Vue.use(VueApollo);
Vue.component("form-alert", Alert)

// Set up request
const request = operation => {
  // if no token with key in the localStorage, add it
  if (!localStorage.token) {
    localStorage.setItem("token", "");
  }

  // operation adds the token to an authorization header that is to be sent to server
  operation.setContext({
    headers: {
      authorization: localStorage.getItem("token")
    }
  });
};

// set up the request handlers for the http clients
const requestLink = new ApolloLink((operation, forward) => {
  return new Observable(observer => {
    let handle;
    Promise.resolve(operation)
      .then(oper => {
        request(oper);
      })
      .then(() => {
        handle = forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer)
        });
      })
      .catch(observer.error.bind(observer));
    return () => {
      if (handle) handle.unsubscribe();
    };
  });
});

// websocket link for subscriptions
const wsLink = ApolloLink.from([
  onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        console.log(
          `[GraphQL error]: Message: ${err.message},Location: ${
            err.locations
          }, Path: ${err.path}`
        );
        if (err.name === "AuthenticationError") {
          console.log(err);
        }
      }
    }
    if (networkError) {
      console.log("[networkError]", networkError);
    }
  }),

  requestLink,

  new WebSocketLink({
    uri: `ws://localhost:4000/graphql`,
    options: {
      reconnect: true,
      connectionParams: () => {
        if (localStorage.token) {
          const token = localStorage.getItem("token");
          return {
            Authorization: token
          };
        }
      }
    }
  })
]);

// HTTP link for queries and mutations
const httpLink = ApolloLink.from([
  onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        console.dir(err);
        if (err.name === "AuthenticationError") {
          console.log(err.name);
        }
      }
    }
    if (networkError) {
      console.log("[networkError", networkError);
    }
  }),

  requestLink,

  // Create file upload link
  new createUploadLink({
    uri: `http://localhost:4000/graphql`,
    credentials: "include"
  })
]);

// Link to direct ws and http traffic to the correct place
const link = ApolloLink.split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  httpLink
);

// Set up apolloClient and apolloProvider
export const defaultClient = new ApolloClient({
  link,
  cache: new InMemoryCache()
});
const apolloProvider = new VueApollo({
  defaultClient
});

Vue.config.productionTip = false;

new Vue({
  apolloProvider,
  router,
  store,
  render: h => h(App)
}).$mount("#app");
