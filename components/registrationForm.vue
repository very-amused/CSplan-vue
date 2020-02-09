<template lang="pug">
  v-card(width=420)
    //- Form area
    div(v-show="visibility.form")
      v-card-title Create an Account
      v-divider
      v-form
        v-col(align="center")
          v-row(class="ma-0")
            v-text-field(label="First Name" hint="(optional)" class="first-name" :color="color" v-model="fields.firstName" :error-messages="errors.firstName" filled rounded)
            v-text-field(label="Last Name" hint="(optional)" class="last-name" :color="color" v-model="fields.lastName" :error-messages="errors.lastName" filled rounded)
          v-text-field(label="Email" type="email" :color="color" v-model="fields.email" @change="validateEmail" :error-messages="errors.email" filled rounded validate-on-blur)
          v-text-field(label="Password" type="password" :color="color" v-model="fields.password" @change="validatePassword" :error-messages="errors.password" filled rounded hint="Make this secure!" validate-on-blur)
          v-btn(large outlined rounded :color="color" class="mt-0 white--text" @click="submit") Create

    //- Progress area
    div(v-show="visibility.progress")
      v-col(align="right")
        v-list
          v-list-item(v-for="spinner in spinners" :key="spinner.message" v-show="spinner.show")
            v-list-item-avatar
              v-progress-circular(v-show="spinner.spin" :color="color" :indeterminate="spinner.spin")
              v-icon(v-show="!spinner.spin" :color="spinner.icon.color") {{ spinner.icon.name }}
            v-list-item-content
              v-list-item-subtitle {{ spinner.message }}
          v-list-item(v-show="submissionError")
            v-list-item-content
              v-card-text(class="red--text pa-0") {{ submissionError }}
</template>

<script>
import * as _crypto from '~/middleware/crypto';
export default {
  data () {
    return {
      // Data concerning the value of fields
      fields: {
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      },
      // Data concerning the visibility state of form elements
      visibility: {
        form: true,
        progress: false
      },
      // Progress spinners
      spinners: [
        {
          message: 'Creating your CSplan account',
          icon: {
            name: '',
            color: 'green'
          },
          show: false,
          spin: false
        },
        {
          message: 'Generating your secure keypair',
          icon: {
            name: '',
            color: 'green'
          },
          show: false,
          spin: false
        },
        {
          message: 'Logging in',
          icon: {
            name: '',
            color: 'green'
          },
          show: false,
          spin: false
        }
      ],
      // Data concerning whether a submit has been attempted for the form
      hasBeenSubmitted: false,
      // Validation errors for fields
      validationErrors: {
        email: [],
        password: []
      },
      // A submission error (if one has occured)
      submissionError: ''
    };
  },

  computed: {
    // Whether the form is valid or not
    errors () {
      const errors = {
        firstName: [],
        lastName: [],
        email: [...this.validationErrors.email],
        password: [...this.validationErrors.password]
      };
      if (this.hasBeenSubmitted) {
        for (const i in errors) {
          if (!this.fields[i]) {
            errors[i].push('This field is required');
          }
        }
        // Inform user of the invisible character limit on name fields
        for (const field of ['firstName', 'lastName']) {
          if (this.fields[field].length > 100) {
            errors[field].push('Must be no longer than 100 characters');
          }
        }
      }
      return errors;
    },
    color () {
      return this.$store.state.color;
    }
  },

  methods: {
    validateEmail () {
      // https://emailregex.com/
      // eslint-disable-next-line
      const emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
      if (!emailRegex.test(this.fields.email)) {
        this.validationErrors.email.push('Invalid email');
      }
      else {
        // Email is valid, clear any previous validation errors
        this.validationErrors.email = [];
      }
    },
    validatePassword () {
      const passwd = this.fields.password;
      // Password requirements and validation
      if (passwd.length < 12) {
        this.validationErrors.password.push('Must be at least 12 characters');
      }
      else if (passwd.length > 64) {
        this.validationErrors.password.push('Must be no longer than 64 characters');
      }
      else {
        // Password is valid, clear any previous validation errors
        this.validationErrors.password = [];
      }
    },
    async submit () {
      // Show that the form has been submitted, which causes empty, required fields to show errors
      this.hasBeenSubmitted = true;
      // Don't submit the form if there are errors
      for (const i in this.errors) {
        if (this.errors[i].length) {
          return;
        }
      }

      // Generate the user's RSA keypair for use in clientside cryptography
      try {
        _crypto.cryptoCheck();
      }
      catch (err) {
        this.submissionError = err;
        return;
      }
      const keyInfo = await _crypto.generateMasterKeypair(this.fields.password);

      // Encrypt the user's first and last name
      const encryptedFirstName = this.fields.firstName.length ? await _crypto.publicEncrypt(this.fields.firstName, keyInfo.keys.publicKey) : null;
      const encryptedLastName = this.fields.lastName.length ? await _crypto.publicEncrypt(this.fields.lastName, keyInfo.keys.publicKey) : null;

      // API requests to be made in the registration process
      const reqs = [
        {
          method: 'POST',
          url: 'http://localhost:3000/API/register',
          data: {
            firstName: encryptedFirstName,
            lastName: encryptedLastName,
            email: this.fields.email,
            password: this.fields.password
          },
          headers: {
            'Content-Type': 'application/json'
          }
        },
        {
          method: 'POST',
          url: 'http://localhost:3000/API/login',
          data: {
            email: this.fields.email,
            password: this.fields.password
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      ];

      // Replace form area with progress area
      this.visibility.form = false;
      this.visibility.progress = true;

      let response;
      for (let i = 0; i < reqs.length; i++) {
        // Stop making requests if an error has occured
        if (this.submissionError) {
          return;
        }

        this.spinners[i].show = true;
        this.spinners[i].spin = true;

        // Make the request using Axios
        try {
          if (i > 2) {
            await this.$axios(reqs[i]);
          }
          // Save the response if it's the final request, which returns a JWT
          else {
            response = await this.$axios(reqs[i]);
          }
          // Change spinner to success icon
          this.spinners[i].icon.name = 'mdi-check';
        }
        catch (err) {
          // Display error message
          this.submissionError = err.response ? err.response.data.message : 'Unable to complete the request';
          // Change spinner to error icon
          this.spinners[i].icon.name = 'mdi-alert-circle';
          this.spinners[i].icon.color = 'red';
        }
        finally {
          this.spinners[i].spin = false;
        }
      }

      if (this.submissionError) {
        return;
      }

      // Store the token in localStorage and vuex
      this.$store.commit('user/setToken', response.data.token);
      // Store the user's information in localStorage and vuex
      this.$store.commit('user/setInfo', response.data.info);

      // Finally, redirect the user back to the landing page
      this.$router.replace('/');
    }
  }
};
</script>

<style>
.passwd-requirements {
  text-decoration: underline !important;
}
.first-name {
  width: 40% !important;
  margin-right: 0.5rem !important;
}
.last-name {
  width: 40% !important;
  margin-left: 0.5rem !important;
}
</style>
