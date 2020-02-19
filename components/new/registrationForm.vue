<template lang="pug">
  div(class="card")
    div(class="card-content")
      div(class="media-content")
        header(class="title is-3") Create an Account
        b-field(label="First Name" message="(optional)")
          b-input(v-model="fields.firstName" maxlength="100" :has-counter="false")
        b-field(label="Last Name" message="(optional)")
          b-input(v-model="fields.lastName" maxlength="100" :has-counter="false")
        b-field(label="Email")
          b-input(v-model="fields.email" id="emailInput" type="email" icon="at")
        b-field(label="Password")
          //- The password field uses a custom validation function, but still relies on the html5 validity state of the input
          b-input(v-model="fields.password" id="passwordInput" type="password" password-reveal icon="lock" maxlength="60" @blur="validatePassword")
        b-button(:expanded="true" type="is-primary") Create
</template>

<script>
export default {
  data () {
    return {
      fields: {
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      }
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
        if (!elements[i].checkValidity() || !elements[i].length) {
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
      if (!regex.test(this.fields.password)) {
        document.querySelector('#passwordInput')
          .setCustomValidity('Password does not meet the requirements listed below.');
        return false;
      }
      else {
        // Setting an empty string as the validation message revalidates the password field
        document.querySelector('#passwordInput')
          .setCustomValidity('');
        return true;
      }
    }
  }
};
</script>
