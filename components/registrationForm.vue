<template lang="pug">
  v-card(width=400)
    v-card-title Create an Account
    v-divider
    v-form
      v-col(align="center")
        v-text-field(label="Email" type="email" :color="color" v-model="fields.email" :error-messages="errors.email" @change="emailChange" filled rounded)
        v-text-field(label="Password" type="password" :color="color" v-model="fields.password" :error-messages="errors.password" @change="passwordChange" filled rounded hint="Make this secure!")
        v-btn(large :color="color" class="mt-0 white--text") Create
</template>

<script>
export default {
  data () {
    return {
      // Highlight color for form elements
      color: 'blue',
      // Data concerning the value of fields
      fields: {
        email: null,
        password: null
      },
      // Data concerning whether fields are clear (haven't been touched yet)
      clear: {
        email: true,
        password: true
      }
    };
  },

  computed: {
    errors () {
      const errors = {
        email: [],
        password: []
      };

      // https://emailregex.com/
      // eslint-disable-next-line
      const emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
      if (!this.clear.email && !this.fields.email.match(emailRegex)) {
        errors.email.push('Invalid email');
      }

      return errors;
    }
  },

  methods: {
    // Change handler for email
    emailChange () {
      this.clear.email = !(this.fields.email && this.fields.email.length);
    },
    // Change handler for password
    passwordChange () {
      this.clear.password = !(this.fields.password && this.fields.password.length);
    }
  }
};
</script>
