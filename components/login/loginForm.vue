<template lang="pug">
div(class="card")
  section(class="card-content-slim")
    header(class="title") Login
    form(action="" onsubmit="return false")
      b-field(label="Email")
        b-input(v-model="fields.email" id="email" type="email" icon="at")
      b-field(label="Password")
        b-input(v-model="fields.password" id="password" type="password" icon="lock" maxlength=60)
      b-button(@click="submit" native-type="submit" type="is-primary" expanded) Submit
    section(class="v-group mt-1")
      span {{ error.message }}
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
    validate () {
      for (const field in this.fields) {
        const el = document.querySelector(`#${field}`);
        if (!el.checkValidity() || !el.value.length) {
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
            this.error.title = `${body.status} - ${body.title}`;
            this.error.message = body.detail;
          }
        });
    }
  }
};
</script>

<style scoped>
@import '~/assets/css/slim-card.css';
@import '~/assets/css/v-group.css';
</style>
