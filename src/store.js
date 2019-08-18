import Vue from 'vue'
import Vuex from 'vuex'
import {
  defaultClient as apolloClient
} from "./main"
import router from './router'
import {
  gql
} from 'apollo-boost'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
    error: null,
    loading: false,
    authError: null,
    pics: [],


  },
  mutations: {
    setUser: (state, payload) => {
      state.user = payload
    },
    setPics: (state, payload) => {
      state.pics = payload
    },
    setLoading: (state, payload) => {
      state.loading = payload
    },
    setError: (state, payload) => {
      state.error = payload
    },
    setAuthError: (state, payload) => {
      state.authError = payload
    },
    clearError: state => (state.error = null)

  },
  actions: {
    getPics: ({
      commit
    }) => {
      commit("setloading", true)
      apolloClient
        .query({
          query: gql `
          query {
            getPics {
              _id
              title
              imageId
              imageBase64
              imageFilename
              createdDate
              createdBy {
                _id
                username
                avart
              }
            }
          }`
        })
        .then(({
          data
        }) => {
          console.log(data)
          commit("setPics", data.getPics)
          commit("setLoading", false)
        })
        .catch(err => {
          commit("setLoading", false)
          console.log(err)
        })
    },

    signupUser: ({
      commit
    }, payload) => {
      commit("clearError")
      commit("setLoading", true)
      apolloClient
        .mutate({
          mutation: gql `
          mutation($username: String!, $password: String!, $email: String!) {
            signupUser(username: $username, password: $password, email: $email) {
              token
            }
          }`,
          variables: payload
        })
        .then(({
          data
        }) => {
          console.log(data)
          commit("setLoading", false)
          localStorage.setItem("token", data.signupUser.token)
          router.go()
        })
        .catch(err => {
          commit("setLoading", false)
          commit("setError", err)
          console.log(err)
        })
    },

    getCurrentUser: ({
      commit
    }) => {
      commit("setLoading", true)
      apolloClient
        .query({
          query: gql `
          query {
            getCurrentUser {
              _id
              username
              email
              password
              avart
              joinDate
            }
          }`
        })
        .then(({
          data
        }) => {
          console.log(data)
          commit("setLoading", false)
          commit("setUser", data.getCurrentUser)
        })
    }

  },

  getters: {
    user: state => state.user,
    loading: state => state.loading,
    error: state => state.error,
    authError: state => state.authError,
    pics: state => state.pics
  }
})
