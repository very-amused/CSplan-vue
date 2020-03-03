<template lang="pug">
  div(class="card")
    div(class="card-content")
      div(class="media")
        figure(class="media-left")
          b-icon(id="icon" icon="account-circle" custom-class="avatar-icon")
        div(class="media-content")
          b-field
            b-input(v-model="fields.firstName" placeholder="First Name (optional)" maxlength="100")
          b-field
            b-input(v-model="fields.lastName" placeholder="Last Name (optional)" maxlength="100")
          b-field
            b-input(v-model="fields.username" placeholder="Username (optional)" maxlength="100")
          b-button(type="is-success" @click="submit" icon-right="arrow-right") Next
</template>

<script>
import { setName } from '~/_middleware/handlers/name';
import * as _crypto from '~/_middleware/crypto';
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

      // ADD: encrypt first and last name using the user's public key and submit to backend
      const publicKey = await _crypto.importPublicKey(this.$store.state.user.keys.publicKey)
        .catch(() => {
          this.error = 'An error occured while importing your public encryption key';
          this.$buefy.dialog.alert({
            title: 'Error',
            message: this.error,
            type: 'is-danger'
          });
        });
      if (this.error) {
        return;
      }
      let encryptedFirstName = '';
      let encryptedLastName = '';
      let encryptedUsername = '';

      // Encrypt only the fields that have been filled out
      if (this.fields.firstName.length) {
        encryptedFirstName = await _crypto.publicEncrypt(this.fields.firstName, publicKey);
      }
      if (this.fields.lastName.length) {
        encryptedLastName = await _crypto.publicEncrypt(this.fields.lastName, publicKey);
      }
      if (this.fields.username.length) {
        encryptedUsername = await _crypto.publicEncrypt(this.fields.username, publicKey);
      }

      // Submit data to backend
      await setName(this.$axios, {
        firstName: encryptedFirstName,
        lastName: encryptedLastName,
        username: encryptedUsername
      })
        .catch((err) => {
          this.error = err.data.message || 'An unknown error occured while setting your display name. Try again later.';
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
.card {
  min-width: 40rem;
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
