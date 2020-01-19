<template lang="pug">
  v-card(width=420)
    //- Form area
    div(v-show="visibility.form")
      v-card-title Create an Account
      v-divider
      v-form
        v-col(align="center")
          v-text-field(label="Email" type="email" :color="color" v-model="fields.email" :rules="[emailValidate]" filled rounded validate-on-blur)
          v-text-field(label="Password" type="password" :color="color" v-model="fields.password" :rules="[passwordValidate]" filled rounded hint="Make this secure!" validate-on-blur)
          v-btn(large :color="color" class="mt-0 white--text" @click="submit") Create

    //- Progress area
    div(v-show="visibility.progress")
      v-col(align="right")
        v-list
          v-list-item(v-for="spinner in spinners" v-show="spinner.show")
            v-list-item-avatar
              v-progress-circular(v-show="spinner.spin" :color="color" :indeterminate="spinner.spin")
              v-icon(v-show="!spinner.spin" :color="spinner.icon.color") {{ spinner.icon.name }}
            v-list-item-content
              v-list-item-subtitle {{ spinner.message }}
          v-list-item(v-show="error")
            v-list-item-content
              v-card-text(class="red--text pa-0") {{ error }}
</template>

<script>
export default {
  data () {
    return {
      // Highlight color for form elements
      color: 'blue',
      // Data concerning the value of fields
      fields: {
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
      // Submission/creation error
      error: ''
    };
  },

  computed: {
    // Whether the form is valid or not
    isValid () {
      return (this.emailValidate() === true && this.passwordValidate() === true);
    }
  },

  methods: {
    emailValidate () {
      // https://emailregex.com/
      // eslint-disable-next-line
      const emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
      if (!this.fields.email.length) {
        return 'An email is required';
      }
      else if (!this.fields.email.match(emailRegex)) {
        return 'Invalid email';
      }
      else {
        return true;
      }
    },
    passwordValidate () {
      const passwd = this.fields.password;
      // Password requirements and validation
      if (passwd.length < 12) {
        return 'Must be at least 12 characters';
      }
      else if (passwd.length > 64) {
        return 'Must be no longer than 64 characters';
      }
      return true;
    },
    async submit () {
      // Don't submit the form if there are any errors
      if (!this.isValid) {
        return;
      }

      // API requests to be made in the registration process
      const reqs = [
        {
          method: 'POST',
          url: 'http://localhost:3000/API/register',
          data: {
            email: this.fields.email,
            password: this.fields.password
          },
          headers: {
            'Content-Type': 'application/json'
          }
        },
        {
          method: 'POST',
          url: 'http://localhost:3000/API/keygen',
          data: {
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
        if (this.error) {
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
          this.error = err.response.data.message;
          // Change spinner to error icon
          this.spinners[i].icon.name = 'mdi-alert-circle';
          this.spinners[i].icon.color = 'red';
        }
        finally {
          this.spinners[i].spin = false;
        }
      }

      // Store the JWT in localStorage and vuex
      if (process.browser) {
        localStorage.setItem('token', response.data.token);
        this.$store.commit('setToken', response.data.token);
      }
      const info = await this.$axios({
        method: 'GET',
        url: 'http://localhost:3000/API/me/info',
        headers: {
          Authorization: `Bearer ${this.$store.state.token}`
        }
      });
      const displayName = (info.data.firstName && info.data.lastName) ? `${info.data.firstName} ${info.data.lastName}` : info.data.ID;
      this.$store.commit('setDisplayName', displayName);
    }
  }
};
</script>

<style>
.passwd-requirements {
  text-decoration: underline !important;
}
</style>
