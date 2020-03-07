<template ref="navbar" lang="pug">
  b-navbar(type="is-dark")
    template(slot="start")
      b-navbar-item(tag="nuxt-link" to="/") Dashboard
      b-navbar-item(tag="nuxt-link" to="/todos") Todos
      b-navbar-item(tag="nuxt-link" to="/") Calendar
    template(slot="end")
      b-navbar-dropdown(v-if="user.isLoggedIn" right :label="user.displayName")
        b-navbar-item(@click="logout") Sign Out
      b-navbar-item(v-else tag="div" class="buttons")
        b-button(tag="nuxt-link" to="/account/register" type="is-light" rounded) Register
        b-button(type="is-primary" rounded) Log in
</template>

<script>
import { logout } from '~/_middleware/handlers/auth';
import { UserState } from '~/store/user'; // eslint-disable-line
export default {
  data () {
    return {
      user: {
        // Default props for SSR
        isLoggedIn: true,
        isLoading: true,
        displayName: ''
      }
    };
  },

  mounted () {
    this.$store.commit('user/getName', this.$axios);
    // Update the user info
    this.user = this.$store.state.user;
  },

  methods: {
    async logout () {
      // Log the user out from the API
      await logout(this.$axios);
      // Log the user out in the state
      this.$store.commit('user/logout');
    }
  }
};
</script>
