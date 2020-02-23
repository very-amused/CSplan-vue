<template lang="pug">
  div
    b-steps(v-model="activeStep" :has-navigation="false")
      b-step-item(label="Registration" icon="account" :type="steps.registration.type")
      b-step-item(label="Login" :type="steps.login.type" icon="account-check")
      b-step-item(label="Secure Key Generation" :type="steps.keygen.type" icon="lock")
      b-step-item(label="Personalization" icon="pencil")
    div(class="columns is-centered is-vcentered")
      div(class="column is-narrow")
        registration-form(@success="registerSuccess($event)" @error="registerError($event)")
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
          index: 0,
          type: ''
        },
        login: {
          index: 1,
          type: ''
        },
        keygen: {
          index: 2,
          type: ''
        }
      }
    };
  },

  methods: {
    /**
     * Called on the successful completion of a step in registration
     * @param {string} event - The completed step
     */
    registerSuccess (event) {
      const index = this.steps[event].index;
      this.steps[event].type = 'is-success';
      this.activeStep = index + 1;
    },
    /**
     * Called if an error occurs in creating or logging into an account
     * @param {string} event - The step in which the error occured
     */
    registerError (event) {
      this.steps[event].type = 'is-danger';
    }
  }
};
</script>

<style>
.columns {
  min-height: 65vh;
}
</style>
