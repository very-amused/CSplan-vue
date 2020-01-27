<template lang="pug">
  v-app
    nav-drawer
    v-content
      nuxt
</template>

<script>
import navDrawer from '~/components/navDrawer';
export default {
  components: {
    navDrawer
  },

  mounted () {
    // Initialize state with data from localStorage
    this.$store.commit('init');
    // Subscribe to all store updates and commit them to localStorage
    this.$store.subscribe((mutation, state) => {
      localStorage.setItem('store', JSON.stringify(state));
    });
  }
};
</script>
