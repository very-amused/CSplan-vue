<template lang="pug">
div(class="container")
  loginForm
</template>

<script>
import loginForm from '~/components/login/loginForm';
export default {
  components: {
    loginForm
  }
};
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
}
</style>
