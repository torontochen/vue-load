import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Signup from './components/Signup.vue'
import Signin from './components/Signin.vue'
import Addpic from './components/Addpic.vue'


Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [{
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/signup',
      name: 'signup',
      component: Signup
    },
    {
      path: '/signin',
      name: 'signin',
      component: Signin
    },
    {
      path: '/addpic',
      name: 'addpic',
      component: Addpic
    }
  ]
})
