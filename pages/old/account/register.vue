<template lang="pug">
  v-container(id="container" fluid class="d-flex flex-row justify-center" fill-height)
    v-container(class="d-flex flex-column align-center")
      registration-form(style="margin-bottom: 4rem;")
</template>

<script>
import registrationForm from '~/components/registrationForm';
export default {
  layout: 'account',

  components: {
    registrationForm
  }
};
</script>

<style scoped>
#container {
  background-image: radial-gradient(circle at center, white 0, #BDBDBD 30%, #9E9E9E 50%, #757575 80%, #616161 90%) !important;
}
</style>
