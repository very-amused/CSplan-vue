<template lang="pug">
  div(class="card")
    div(class="card-content")
      div(class="media-content")
        header(class="title is-3") Create an Account
        b-field(label="Email")
          b-input(v-model="fields.email" id="emailInput" type="email" icon="at")
        b-field(label="Password")
          //- The password field uses a custom validation function, but still relies on the html5 validity state of the input
          b-input(v-model="fields.password" id="passwordInput" type="password" password-reveal icon="lock" maxlength="60" @blur="validatePassword")
        b-field
          b-button(:expanded="true" @click="submit" type="is-primary") Create
        div(v-show="error" class="media")
          figure(class="media-left")
            b-icon(icon="alert-circle" type="is-danger")
          div(class="media-content")
          p(class="has-text-danger errorMsg") {{ error }}
</template>

<script>
import * as _auth from '~/middleware/handlers/auth';
import * as _crypto from '~/middleware/crypto';
export default {
  data () {
    return {
      fields: {
        email: '',
        password: ''
      },
      error: null
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

      // Create the user's account
      await _auth.register(this.$axios, {
        email: this.fields.email,
        password: this.fields.password
      })
        .catch((err) => {
          // Set the error message to the 'message' prop returned by the API
          this.error = err.data.message || 'An unknown error occured, refresh the page and try again.';
          this.$emit('error', 'registration');
        });
      if (this.error) {
        return;
      }

      /* Emit the success event if no errors occured in submission */
      this.$emit('success', 'registration');

      // Log the user in
      const token = await _auth.login(this.$axios, {
        email: this.fields.email,
        password: this.fields.password
      })
        .catch((err) => {
          this.error = err.data.message || 'An unknown error occured, refresh the page and try again.';
          this.$emit('error', 'keygen');
        });
      if (this.error) {
        return;
      }

      this.$store.commit('user/setToken', token); // Store the token in the Vuex state
      this.$emit('success', 'login');

      // Pass the handling logic to the keyGenerate function
      this.keyGenerate();
    },
    /**
     * @private
     */
    async keyGenerate () {
      const keyInfo = await _crypto.generateMasterKeypair(this.fields.password)
        .catch((err) => {
          this.error = err.message || 'An unknown error occured, refresh the page and try again.';
          this.$emit('error', 'keygen');
        });
      if (this.error) {
        return;
      }

      // Store the pubkey and unencrypted private key in the Vuex state
      this.$store.commit('user/setKeys', {
        publicKey: keyInfo.keys.publicKey,
        privateKey: keyInfo.keys.privateKey
      });

      // Submit the pubkey, encrypted private key, and PBKDF2 salt to the server for storage
      await _auth.storeKeypair(this.$axios, { ...keyInfo.keys }, keyInfo.PBKDF2salt)
        .catch((err) => {
          this.error = err.data.message || 'An unknown error occured, refresh the page and try again.';
          this.$emit('error', 'keygen');
        });

      // Emit the success event if no errors occured
      if (!this.error) {
        this.$emit('success', 'keygen');
      }
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
