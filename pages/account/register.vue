<template lang="pug">
  div(class="columns is-centered is-vcentered")
    div(class="column is-narrow")
      registration-form
</template>

<script>
import registrationForm from '~/components/new/registrationForm';
export default {
  layout: 'new',

  components: {
    registrationForm
  }
};
</script>

<style>
.columns {
  min-height: 80vh;
}
</style>
