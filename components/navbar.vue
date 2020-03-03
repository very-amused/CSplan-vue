<template lang="pug">
  b-navbar(type="is-dark")
    template(slot="start")
      b-navbar-item(tag="nuxt-link" to="/") Dashboard
      b-navbar-item(tag="nuxt-link" to="/") Todos
      b-navbar-item(tag="nuxt-link" to="/") Calendar
    template(slot="end")
      b-navbar-item(tag="div")
        div(v-if="user.name")
          b-button(type="is-info") {{ user.name }}
        div(v-else class="buttons")
          b-button(tag="nuxt-link" to="/account/register" type="is-light" rounded) Register
          b-button(type="is-primary" rounded) Log in
</template>

<script>
import { importPrivateKey, privateDecrypt } from '~/_middleware/crypto';
import { getName } from '~/_middleware/handlers/name';
export default {
  data () {
    return {
      user: {
        name: ''
      }
    };
  },

  async mounted () {
    let d;
    try {
      d = await getName(this.$axios);
    }
    catch {
      // The user is not logged in
      return;
    }

    // User with personal info that needs to be decrypted
    if (d.username || d.firstName || d.lastName) {
      const encodedPrivateKey = this.$store.state.user.keys.privateKey;
      // Import the user's private key
      const privateKey = await importPrivateKey(encodedPrivateKey);

      // Decrypt relevant properties
      let firstName;
      let lastName;
      let username;
      if (d.firstName) {
        firstName = await privateDecrypt(d.firstName, privateKey);
      }
      if (d.lastName) {
        lastName = await privateDecrypt(d.lastName, privateKey);
      }
      if (d.username) {
        username = await privateDecrypt(d.username, privateKey);
      }

      const displayName = username || `${firstName || ''}${lastName ? ' ' + lastName : ''}`;
      this.user.name = displayName;
    }
    // Anonymous user
    else {
      this.user.name = 'Anonymous user';
    }
  }
};
</script>
