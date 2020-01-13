<template lang="pug">
  v-container(class="d-flex flex-row justify-center" fill-height)
    v-container(class="d-flex flex-column align-center")
      v-row(style="margin-bottom: 4rem")
        registration-form(:style="`margin-right: ${componentMargin}`")
        password-reqs(:style="`margin-left: ${componentMargin}`")
</template>

<script>
import registrationForm from '~/components/registrationForm';
import passwordReqs from '~/components/passwordReqs';
export default {
  components: {
    registrationForm,
    passwordReqs
  },

  data () {
    return {
      componentMargin: '0.5rem'
    };
  }
};
</script>
