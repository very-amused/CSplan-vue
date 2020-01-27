<template lang="pug">
  v-card(width=300)
    //- Form area
    div(v-show="visibility.form")
      v-form
        v-col(align="center" class="pb-0")
          v-text-field(label="Email" type="email" :color="color" v-model="fields.email" :error-messages="errors.email" filled rounded)
          v-text-field(label="Password" type="password" :color="color" v-model="fields.password" :error-messages="errors.password" filled rounded)
          v-btn(large outlined rounded :color="color" class="mt-0 white--text" @click="submit") Sign in
          v-card-text Don't have an account? <nuxt-link to="/account/register">Create One!</nuxt-link>
</template>

<script>
export default {
  data () {
    return {
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
      // Data concerning errors with inputs for the form
      errors: {
        email: [],
        password: []
      }
    };
  },

  computed: {
    color () {
      return this.$store.state.color;
    }
  },

  mounted () {
    // Redirect the user to the homepage if they're already logged in
    if (this.$store.state.user.info) {
      this.$router.replace('/');
    }
  },

  methods: {
    async submit () {
      // API requests to be made in the registration process
      const reqs = [
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

      let response;
      try {
        for (let i = 0; i < reqs.length; i++) {
          response = await this.$axios(reqs[i]);
        }
      }
      catch (err) {
        if (err.response.status === 404) {
          this.errors.email.push(err.response.data.message);
          setTimeout(() => {
            this.errors.email = [];
          }, 3000);
        }
        else if (err.response.status === 401) {
          this.errors.password.push(err.response.data.message);
          setTimeout(() => {
            this.errors.password = [];
          }, 3000);
        }
      }

      // Return if there are errors
      for (const i in this.errors) {
        if (this.errors[i].length) {
          return;
        }
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
