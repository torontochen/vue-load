import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/vuetify'
import {
  ApolloClient
} from "apollo-client"
import {
  InMemoryCache
} from "apollo-cache-inmemory"
import {
  CreateUploadLink
} from "apollo-upload-client"
import {
  OnError,
  onError
} from "apollo-link-error"
import {
  ApolloLink,
  Observable
} from "apollo-link"
import {
  WebSocketLink,
} from "apollo-link-ws"
import {
  GetMainDefinition
} from "apollo-utilities"
import VueApollo from "vue-apollo"


// Register Global Component
Vue.use(VueApollo)

//Set up request
const request = operation => {
  // if no token with key in the localStorage, add it
  if (!localStorage.token) {
    localStorage.setItem("token", '')
  }

  //operation adds the token to an authorization header that is to be sent to server
  operation: setContext({
    headers: {
      authorization: localStorage.getItem('token')
    }
  })
}

//set up the request handlers for the http clients
const requestLink = new ApolloLink((operation, forward) => {
  return new Observable(observer => {
    let handle
    Promise.resolve(operation)
      .then(oper => {
        request(oper)
      })
      .then(() => {
        handle = forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer)
        })
      })
      .catch(observer.error.bind(observer))
    return () => {
      if (handle) handle.unsubscribe()
    }
  })
})

// websocket link for subscriptions
const wsLink = ApolloLink.from([
  onError(({
    graphQLErrors,
    networkError
  }) => {
    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        console.log(`[GraphQL error]: Message: ${err.message},Location: ${err.locations}, Path: ${err.path}`)
        if (err.name === 'AuthenticationError') {
          console.log(err)

        }
      }
    }
    if (networkError) {
      console.log("[networkError]", networkError)
    }
  }),

  requestLink,

  new WebSocketLink({
    uri: `ws://localhost:4000/graphql`,
    options: {
      reconnect: true,
      connectionParams: () => {
        if (localStorage.token) {
          const token = localStorage.getItem('token')
          return {
            Authorization: token
          }
        }
      }
    }
  })
])

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
