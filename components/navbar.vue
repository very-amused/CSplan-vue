<template ref="navbar" lang="pug">
  b-navbar(type="is-primary")
    template(slot="start")
      b-navbar-item(tag="nuxt-link" to="/") Dashboard
      b-navbar-item(tag="nuxt-link" to="/todos") Todos
      b-navbar-item(tag="nuxt-link" to="/") Calendar
    client-only(slot="end")
      template(v-if="user.isLoggedIn")
        b-navbar-dropdown(right :label="user.displayName")
          b-navbar-item(@click="logout") Sign Out
      template(v-else)
        b-navbar-item(tag="div" class="buttons")
          b-button(tag="nuxt-link" to="/account/register" type="is-light" rounded) Register
          b-button(type="is-primary" rounded) Log in
</template>

<script>
export default {
  data () {
    return {
      activeItem: ''
    };
  },

  computed: {
    user () {
      const defaultVal = {
        // Default props for SSR
        isLoggedIn: undefined,
        displayName: ''
      };

      return process.client ? this.$store.state.user : defaultVal;
    }
  },

  methods: {
    async logout () {
      // Log the user out in the state
      await this.$store.dispatch('user/logout', this.$axios);
    }
  }
};
</script>
