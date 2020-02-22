<template lang="pug">
  div
    b-steps(v-model="activeStep" :has-navigation="false")
      b-step-item(label="Registration" :type="steps.registration.type")
      b-step-item(label="Secure Key Generation")
      b-step-item(label="Personalization")
    div(class="columns is-centered is-vcentered")
      div(class="column is-narrow")
        registration-form(v-show="activeStep === 0" @success="registerSuccess" @error="registerError")
</template>

<script>
import registrationForm from '~/components/new/registrationForm';
export default {
  layout: 'new',

  components: {
    registrationForm
  },

  data () {
    return {
      activeStep: 0,
      steps: {
        registration: {
          type: ''
        }
      }
    };
  },

  methods: {
    /**
     * Called on the successful creation of an account
     */
    registerSuccess () {
      this.steps.registration.type = 'is-success';
      this.activeStep++;
    },
    /**
     * Called if an error occurs in creating or logging into an account
     */
    registerError () {
      this.steps.registration.type = 'is-danger';
    }
  }
};
</script>

<style>
.columns {
  min-height: 65vh;
}
</style>
