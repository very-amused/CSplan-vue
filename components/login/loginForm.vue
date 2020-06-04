<template lang="pug">
div(class="card")
  section(class="card-content-slim")
    header(class="title") Login
    form(onsubmit="return false")
      b-field(label="Email")
        b-input(v-model="fields.email" ref="email" type="email" icon="at")
      b-field(label="Password")
        b-input(v-model="fields.password" ref="password" type="password" icon="lock" maxlength=60)
      b-button(@click="submit" native-type="submit" type="is-primary" expanded) Submit
    section(class="v-group error-message")
      span(class="has-text-danger") {{ error.message }}
</template>

<script>
export default {
  data () {
    return {
      fields: {
        email: '',
        password: ''
      },
      error: {
        title: '',
        message: ''
      }
    };
  },

  methods: {
    // Validate each field via HTML5
    validate () {
      for (const field in this.fields) {
        if (!this.$refs[field].checkHtml5Validity()) {
          return false;
        }
      }
      return true;
    },
    async submit () {
      if (!this.validate()) {
        return;
      }

      await this.$store.dispatch('user/login', this.fields)
        .catch((err) => {
          if (err.response.data.error) {
            const body = err.response.data.error;
            this.error.message = body.detail;
          }
        });
      if (!this.error.message) {
        this.$router.push('/');
      }
    }
  }
};
</script>

<style scoped>
@import '~/assets/css/slim-card.css';
@import '~/assets/css/v-group.css';
.error-message {
  margin-top: 0.25rem;
}
</style>
