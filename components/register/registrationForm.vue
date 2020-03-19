<template lang="pug">
  div(class="card")
    div(class="card-content")
      article(v-if="!showKeygenLoading" class="media-content")
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
      article(v-else class="media-content")
        header(class="title is-4") Generating your secure master keypair...
        b-progress(type="is-success")
        p(class="has-text-danger errorMsg") {{ error }}
</template>

<script>
import * as _auth from '~/_middleware/handlers/auth';
import * as _crypto from '~/_middleware/crypto';
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
      await this.$emit('success', 'registration');

      // Log the user in
      const token = await this.$store.dispatch('user/login', {
        axios: this.$axios,
        body: {
          email: this.fields.email,
          password: this.fields.password
        }
      })
        .catch((err) => {
          this.error = err.data.message || 'An unknown error occured, refresh the page and try again.';
          this.$emit('error', 'keygen');
        });
      if (this.error) {
        return;
      }

      // Store the token in the cookies (expires after a week)
      if (this.$cookie.get('Authorization')) {
        this.$cookie.delete('Authorization');
      }
      this.$cookie.set('Authorization', token, { expires: 7 });

      this.$store.commit('user/login');
      this.$store.commit('user/setName', {
        username: 'Anonymous User'
      });
      await this.$emit('success', 'login');

      // Pass the handling logic to the keyGenerate function
      this.keyGenerate();
    },
    /**
     * @private
     */
    async keyGenerate () {
      // Show the key generation loading bar
      this.showKeygenLoading = true;

      // Generate the user's master keypair
      const keyInfo = await _crypto.generateMasterKeypair(this.fields.password)
        .catch((err) => {
          this.error = err.message || 'An unknown error occured, refresh the page and try again.';
          this.$emit('error', 'keygen');
        });
      if (this.error) {
        return;
      }

      /* Store the pubkey and unencrypted private key in the localStorage,
      and load them into the Vuex state */
      localStorage.setItem('keys', JSON.stringify({
        publicKey: keyInfo.keys.publicKey,
        privateKey: keyInfo.keys.privateKey
      }));
      await this.$store.dispatch('user/getKeys');

      // Submit the pubkey, encrypted private key, and PBKDF2 salt to the server for storage
      await _auth.storeKeypair(this.$axios, { ...keyInfo.keys }, keyInfo.PBKDF2salt)
        .catch((err) => {
          this.error = err.data ? err.data.message : 'An unknown error occured, refresh the page and try again.';
          this.$emit('error', 'keygen');
        });

      // Emit the success event if no errors occured
      if (!this.error) {
        await this.$emit('success', 'keygen');
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
