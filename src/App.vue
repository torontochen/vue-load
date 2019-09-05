<template>
  <v-app style="background: #E8EAF6">
    <!-- Navbar -->
    <v-toolbar
      fixed
      color="primary lighten-1"
      dark
    >
      <!-- App Title -->
      <v-toolbar-title class="hidden-xs-only">
        <router-link
          to="/"
          tag="span"
          style="cursor: pointer"
        >
          Gallery
        </router-link>
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <!-- Navbar Links -->

      <v-toolbar-items>
        <v-layout v-if="!user">
          <v-btn
            flat
            v-for="item in navItems"
            :key="item.title"
            :to="item.link"
          >
            <v-icon
              class="hidden-sm-only ma-1"
              left
            >{{item.icon}}</v-icon>
            {{item.title}}
          </v-btn>
        </v-layout>
        <v-layout v-else>
          <v-layout>
            <v-btn
              class="primary lighten-1"
              flat
            >Welcome!  {{user.username}}</v-btn>
          </v-layout>
          <v-layout>
            <v-btn
              flat
              v-if="user"
              to="/addpic"
            >
              <v-icon
                left
                class="hidden-sm-only ma-1"
              >attachment</v-icon>
              Add Picture
            </v-btn>
          </v-layout>
          <v-layout>
            <v-btn
              flat
              v-if="user"
              @click="handleSignoutUser"
            >
              <v-icon
                left
                class="hidden-sm-only ma-1"
              >exit_to_app</v-icon>
              Signout
            </v-btn>
          </v-layout>

        </v-layout>
      </v-toolbar-items>
    </v-toolbar>

    <!-- Content -->
    <main>
      <v-container class="mt-4">
        <transition name='fade'>
          <router-view />
        </transition>

        <!-- Auth Snackbar -->
        <v-snackbar
          v-model="authSnackbar"
          color="success"
          :timeout="6000"
          bottom
          left
        >
          <v-icon>check_circle</v-icon>
          <h3>You are now Signed in!</h3>
          <v-btn
            dark
            flat
            @click="authSnackbar=false"
          >
            Close
          </v-btn>
        </v-snackbar>

        <!-- Auth Error Snackbar -->
        <v-snackbar
          v-if="authError"
          v-model="authErrorSnackbar"
          color="warning"
          :timeout="6000"
          bottom
          left
        >
          <v-icon class="mr-3">cancel</v-icon>
          <h3>{{authError.message}}</h3>
          <v-btn
            dark
            flat
            to="/signin"
          >
            Sign in
          </v-btn>
        </v-snackbar>
      </v-container>
    </main>
  </v-app>
</template>

<script>
import { mapGetters } from "vuex";
import { setTimeout } from "timers";

export default {
  name: "App",
  data() {
    return {
      authSnackbar: false,
      authErrorSnackbar: false
    };
  },
  watch: {
    user(newValue, oldValue) {
      if (oldValue == null) {
        this.authSnackbar = true;
      }
    },
    authError(value) {
      if (value !== null) {
        this.authErrorSnackbar = true;
      }
    }
  },
  computed: {
    ...mapGetters(["authError", "user"]),
    navItems() {
      let items = [
        { icon: "lock_open", title: "Sign In", link: "/signin" },
        { icon: "create", title: "Sign Up", link: "/signup" }
      ];
      return items;
    }
  },
  methods: {
    handleSignoutUser() {
      this.$store.dispatch("signoutUser");
    }
  }
};
</script>

<style scoped>
h1 {
  font-weight: 400;
  font-size: 2.5rem;
}

h2 {
  font-weight: 400;
  font-size: 2rem;
}

.fade-enter-active,
.fade-leave-active {
  transition-property: opacity;
  transition-duration: 0.25s;
}

.fade-enter-active {
  transition-delay: 0.25s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
</style>
