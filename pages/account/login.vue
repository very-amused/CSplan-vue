<template lang="pug">
div(class="container")
  loginForm
</template>

<script>
import { mapState } from 'vuex';
import loginForm from '~/components/login/loginForm';
export default {
  components: {
    loginForm
  },

  computed: {
    ...mapState({
      isLoggedIn: state => state.user.isLoggedIn
    })
  },

  mounted () {
    if (this.isLoggedIn) {
      this.$router.replace('/');
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 85vh;
}
</style>
