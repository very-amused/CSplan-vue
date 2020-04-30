<template lang="pug">
div(class="card")
  div(class="card-content")
    article(v-if="!showKeygenLoading" class="media-content")
      form(action="" onsubmit="return false")
        header(class="title is-3") Create an Account
        b-field(label="Email")
          b-input(v-model="fields.email" id="emailInput" type="email" icon="at")
        b-field(label="Password")
          //- The password field uses a custom validation function, but still relies on the html5 validity state of the input
          b-input(v-model="fields.password" id="passwordInput" type="password" password-reveal icon="lock" maxlength="60" @blur="validatePassword")
        b-field
          b-button(:expanded="true" @click="submit" native-type="submit" type="is-primary") Create
        div(v-show="error" class="media")
          figure(class="media-left")
            b-icon(icon="alert-circle" type="is-danger")
          div(class="media-content")
          p(class="has-text-danger errorMsg") {{ error }}
    article(v-else class="media-content")
      header(class="title is-4") Generating your secure master keypair...
      b-progress(type="is-success")
      p(class="has-text-danger errorMsg") {{ error }}
</template>

<script>
export default {
  data () {
    return {
      fields: {
        email: '',
        password: ''
      },
      error: null,
      showKeygenLoading: false
    };
  },

  methods: {
    /**
     * Checks the validity of the entire form, called before form submission
     * @returns {Boolean} Validity
     */
    validate () {
      const elements = {
        email: document.querySelector('#emailInput'),
        password: document.querySelector('#passwordInput')
      };

      // The form is invalid if any (required) elements fail html5 validation or are empty
      for (const i in elements) {
        if (!elements[i].checkValidity() || !elements[i].value.length) {
          return false;
        }
      }
      return true;
    },
    /**
     * Validates the password field against regex specifying each requirement
     * @returns {Boolean} Validity
     */
    validatePassword () {
      const regex = new RegExp(/(?=.*[a-z])(?=.*[A-Z])/);
      const passwd = document.querySelector('#passwordInput');
      if (!regex.test(passwd.value)) {
        passwd
          .setCustomValidity('Password does not meet the requirements listed below.');
        return false;
      }
      else {
        // Setting an empty string as the validation message revalidates the password field
        passwd
          .setCustomValidity('');
        return true;
      }
    },
    /**
     * Submits the form and handles the API response
     * @returns {Promise<void>}
     */
    async submit () {
      // Don't submit an invalid form
      if (!this.validate()) {
        return;
      }

      // Clear any errors from a previous submission
      this.error = null;

      // Create the user's account
      try {
        await this.$store.dispatch('user/register', {
          email: this.fields.email,
          password: this.fields.password
        });
      }
      catch (err) {
        this.error = err.response?.data?.error?.detail || 'An unknown error occured while creating your account, refresh the page and try again.';
        this.$emit('error', 'registration');
        return;
      }

      /* Emit the success event if no errors occured in submission */
      await this.$emit('success', 'registration');

      // Log the user in
      try {
        await this.$store.dispatch('user/login', {
          email: this.fields.email,
          password: this.fields.password
        });
      }
      catch (err) {
        this.error = err.response?.data?.error?.detail || 'An unknown error occured while logging into your account, try logging in using the same email and password you used to create your account later.';
        this.$emit('error', 'login');
        return;
      }

      await this.$emit('success', 'login');

      // Show the key generation loading bar
      this.showKeygenLoading = true;

      // Generate the user's master keypair
      try {
        await this.$store.dispatch('user/genKeypair', this.fields);
      }
      catch (err) {
        this.error = 'An error has occured while generating your secure keypair. This is an unrecoverable error at the moment, contact the developer for assistance.';
        this.$emit('error', 'keygen');
        return;
      }

      await this.$emit('success', 'keygen');
    }
  }
};
</script>

<style>
.submitError {
  display: flex;
  flex-direction: row;
}
.errorMsg {
  max-width: 15rem;
}
</style>
