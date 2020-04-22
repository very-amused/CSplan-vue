<template lang="pug">
  div
    b-steps(v-model="activeStep" :has-navigation="false")
      b-step-item(label="Registration" :type="steps.registration.type" :clickable="false" icon="account")
      b-step-item(label="Login" :type="steps.login.type" :clickable="false" icon="account-check")
      b-step-item(label="Secure Key Generation" :type="steps.keygen.type" :clickable="false" icon="lock")
      b-step-item(label="Personalize" :clickable="false" icon="pencil")
    div(class="columns is-centered is-vcentered")
      div(class="column is-narrow")
        registration-form(v-show="activeStep < 3" @success="registerSuccess($event)" @error="registerError($event)")
        personalization-form(v-show="activeStep === 3")
</template>

<script>
import registrationForm from '~/components/register/registrationForm';
import personalizationForm from '~/components/register/personalizationForm';
export default {
  components: {
    registrationForm,
    personalizationForm
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
.b-steps {
  margin-top: 1rem;
}
.columns {
  min-height: 65vh;
}
</style>
