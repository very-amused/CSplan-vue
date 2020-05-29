<template ref="navbar" lang="pug">
  b-navbar(type="is-dark")
    template(slot="start")
      nuxt-link(v-for="page in pages" :key="page.title" :to="page.href" v-slot="{ isActive, href }")
        b-navbar-item(v-if="page.account ? isLoggedIn : true" tag="nuxt-link" :to="href" :active="isActive && href !== '/'") {{ page.title }}
    client-only(slot="end")
      template(v-if="isLoggedIn")
        b-navbar-dropdown(right :label="displayName" collapsible)
          b-navbar-item(@click="showSettingsModal") Settings
          b-navbar-item(@click="logout") Sign Out
      template(v-else)
        b-navbar-item(tag="div" class="buttons")
          b-button(tag="nuxt-link" to="/account/register" type="is-light" rounded) Register
          b-button(tag="nuxt-link" to="/account/login" type="is-primary" rounded) Log in
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
        },
        {
          title: 'Timer',
          href: '/timer'
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

  methods: {
    showSettingsModal () {
      this.$emit('show-settings');
    },
    async logout () {
      // Log the user out in the state
      await this.$store.dispatch('user/logout');
      this.$router.push('/');
    }
  }
};
</script>
