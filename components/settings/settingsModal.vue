<template lang="pug">
b-modal(:active="active" @close="close")
  div(class="card")
    div(class="card-header")
      h1(class="title") Settings
    div(class="card-content")
      //- Username form
      div(class="media")
        article(class="media-left")
          b-button(type="is-text")
            b-icon(icon="account-circle" size="is-large")
        div(class="media-content")
          form(v-if="forms.name.state !== 'static'" onsubmit="return false")
            b-field
              b-input(v-model="forms.name.fields.username" placeholder="Username")
            b-field(grouped)
              b-input(v-model="forms.name.fields.firstName" expanded placeholder="First Name (optional)")
              b-input(v-model="forms.name.fields.lastName" expanded placeholder="Last Name (optional)")
            b-button(@click="updateName" type="is-success" native-type="submit" expanded :loading="forms.name.state === 'loading'") Submit
          p(v-else class="is-size-5") {{ displayName }}
            b-button(@click="forms.name.state = 'editable'" type="is-text" size="is-small")
              b-icon(icon="pencil" size="is-small")
      //- Email form
      div(class="media")
        article(class="media-left")
          b-icon(icon="at" size="is-medium")
        div(class="media-content")
          form(v-if="forms.email.state !== 'static'" onsubmit="return false")
            b-field
              b-input(v-model="forms.email.fields.email")
            b-button(type="is-success" native-type="submit" expanded :loading="forms.email.state === 'loading'")
          p(v-else class="is-size-5") {{ email }}
            b-button(@click="forms.email.state = 'editable'" type="is-text" size="is-small" disabled)
              b-icon(icon="pencil" size="is-small")

      //- Key export form
      div(class="media")
        article(class="media-left")
          b-icon(icon="lock")
        div(class="media-content")
          b-button(@click="exportPublicKey" rounded) Export Master Keypair
          b-field(v-if="forms.keys.exported.publicKey" label="Public Key")
            pre {{ forms.keys.exported.publicKey }}
          div(v-if="forms.keys.showWarning")
            span(class="title has-text-bold has-text-danger") SECURITY WARNING!!!
            br
            span(class="has-text-danger") NEVER SHARE YOUR PRIVATE KEY ANYWHERE, WITH ANYONE, OVER ANY CHANNEL. DOING THIS RISKS COMPROMISING THE ENTIRE SECURITY OF YOUR ACCOUNT AND SHOULD BE CONSIDERED EQUIVALENT TO HANDING OVER YOUR PASSWORD.
            br
            b-button(@click="exportPrivateKey" rounded type="is-danger") I understand.
          b-field(v-if="forms.keys.exported.privateKey" label="Private Key")
            pre {{ forms.keys.exported.privateKey }}
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  props: {
    active: {
      type: Boolean,
      default () {
        return false;
      }
    }
  },

  data () {
    return {
      forms: {
        name: {
          state: 'static',
          inputs: {
            firstName: '',
            lastName: '',
            username: ''
          }
        },
        email: {
          state: 'static',
          fields: {
            email: ''
          }
        },
        keys: {
          exported: {
            publicKey: '',
            privateKey: ''
          },
          showWarning: false
        }
      }
    };
  },

  computed: {
    ...mapGetters({
      displayName: 'user/displayName'
    }),
    email () {
      return this.$store.state.user.email;
    }
  },

  methods: {
    close () {
      this.$emit('close');
    },
    async updateName () {
      this.forms.name.state = 'loading';
      await this.$store.dispatch('user/setName', {
        ...this.forms.name.fields
      });
      this.forms.name.state = 'static';
    },
    exportPublicKey () {
      this.forms.keys.exported.publicKey = 'Sorry, this functionality is not available yet';
      this.forms.keys.showWarning = true;
    }
  }
};
</script>

<style scoped>
.card-header {
  padding: 1rem;
}
</style>
