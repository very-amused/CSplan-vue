<template lang="pug">
b-modal(:active="active" @close="close")
  div(class="card")
    div(class="card-header")
      h1(class="title") Settings
    div(class="card-content")
      div(class="media")
        article(class="media-left")
          b-button(type="is-text")
            b-icon(icon="account-circle" size="is-large")
        div(class="media-content")
          form(v-if="forms.name.state !== 'static'" onsubmit="return false")
            b-field
              b-input(v-model="forms.name.inputs.username" placeholder="Username")
            b-field(grouped)
              b-input(v-model="forms.name.inputs.firstName" expanded placeholder="First Name (optional)")
              b-input(v-model="forms.name.inputs.lastName" expanded placeholder="Last Name (optional)")
            b-button(@click="updateName" type="is-success" native-type="submit" expanded :loading="forms.name.state === 'loading'") Submit
          p(v-else class="is-size-5") {{ displayName }}
            b-button(@click="forms.name.state = 'editable'" type="is-text" size="is-small")
              b-icon(icon="pencil" size="is-small")
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
          state: '',
          inputs: {
            firstName: '',
            lastName: '',
            username: ''
          }
        }
      }
    };
  },

  computed: {
    ...mapGetters({
      displayName: 'user/displayName'
    })
  },

  methods: {
    close () {
      this.$emit('close');
    },
    async updateName () {
      this.forms.name.state = 'loading';
      await this.$store.dispatch('user/setName', {
        ...this.forms.name.inputs
      });
      this.forms.name.state = 'static';
    }
  }
};
</script>

<style scoped>
.card-header {
  padding: 1rem;
}
</style>
