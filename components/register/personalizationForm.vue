<template lang="pug">
  div(class="card")
    div(class="card-content")
      div(class="media")
        figure(class="media-left")
          b-icon(id="icon" icon="account-circle" custom-class="avatar-icon")
        form(class="media-content" action="" onsubmit="return false")
          b-field
            b-input(v-model="fields.firstName" placeholder="First Name (optional)" maxlength="100")
          b-field
            b-input(v-model="fields.lastName" placeholder="Last Name (optional)" maxlength="100")
          b-field
            b-input(v-model="fields.username" placeholder="Username (optional)" maxlength="100")
          b-button(native-type="submit" type="is-success" @click="submit" icon-right="arrow-right") Next
</template>

<script>
export default {
  data () {
    return {
      fields: {
        firstName: '',
        lastName: '',
        username: ''
      },
      error: null
    };
  },

  methods: {
    async submit () {
      // Clear any previous errors
      this.error = null;

      // Skip setting the user's display name if they haven't filled anything out
      if (!(this.fields.firstName || this.fields.lastName || this.fields.username)) {
        await this.$router.replace('/');
        return;
      }

      // Submit data to backend
      await this.$store.dispatch('user/setName', {
        ...this.fields
      })
        .catch((err) => {
          this.error = err.response?.data?.data?.detail || 'An unknown error occured while setting your display name. Try again later.';
          this.$buefy.dialog.alert({
            title: 'Error',
            message: this.error,
            type: 'is-danger'
          });
        });

      /* Redirect the user back to the landing page
      (without leaving a history entry for the login page) */
      if (!this.error) {
        this.$router.replace('/');
      }
    }
  }
};
</script>

<style scoped>
@media screen and (min-width: 1200px) {
  .card {
    min-width: 30rem;
  }
}
</style>

<style lang="scss">
/* Custom SCSS for adjusting the avatar's icon size to 64x64
(max size permitted by Bulma defaults is 24x24 */
$avatar-size: 64px;

.media-left {
  width: $avatar-size;
  height: $avatar-size;
  display: flex;
  justify-content: center;
  align-items: center;
}
.avatar-icon::before {
  font-size: $avatar-size !important;
}

.errorMsg {
  max-width: 30rem;
}
</style>
