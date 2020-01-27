<template lang="pug">
  v-app
    v-content
      v-btn(outlined color="white" class="return-button" to="/" nuxt)
        v-icon mdi-keyboard-return
      nuxt
</template>

<script>
export default {
  computed: {
    color () {
      return this.$store.state.color;
    }
  },

  mounted () {
    // Initialize state with data from localStorage
    this.$store.commit('init');
    // Subscribe to all store updates and commit them to localStorage
    this.$store.subscribe((mutation, state) => {
      localStorage.setItem('store', JSON.stringify(state));
    });
    // Redirect the user to the homepage if they're already logged in
    if (this.$store.state.user.info) {
      this.$router.replace('/');
    }
  }
};
</script>

<style>
.return-button {
  position: absolute !important;
  bottom: 1.5rem !important;
  left: 1rem !important;
}
</style>
