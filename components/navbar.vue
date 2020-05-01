<template ref="navbar" lang="pug">
  b-navbar(type="is-dark")
    template(slot="start")
      nuxt-link(v-for="page in pages" :key="page.title" :to="page.href" v-slot="{ isActive, href }")
        b-navbar-item(v-if="page.account ? isLoggedIn : true" tag="nuxt-link" :to="href" :active="isActive && href !== '/'") {{ page.title }}
    client-only(slot="end")
      template(v-if="isLoggedIn")
        b-navbar-dropdown(right :label="displayName" collapsible)
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
      pages: [
        {
          title: 'Home',
          href: '/'
        },
        {
          title: 'Todos',
          href: '/todos',
          account: true
        },
        {
          title: 'Categories',
          href: '/categories',
          account: true
        }
      ]
    };
  },

  computed: {
    isLoggedIn () {
      return this.$store.state.user.isLoggedIn;
    },
    displayName () {
      return this.$store.getters['user/displayName'];
    }
  },

  async mounted () {
    if (this.isLoggedIn) {
      await this.$store.dispatch('user/updateName');
    }
  },

  methods: {
    async logout () {
      // Log the user out in the state
      await this.$store.dispatch('user/logout');
      this.$router.redirect('/');
    }
  }
};
</script>
