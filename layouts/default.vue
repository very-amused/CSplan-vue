<template lang="pug">
  v-app
    v-navigation-drawer(permanent width=200 color="blue-grey darken-4" app)
      v-list(nav dark)
        v-list-item(v-if="$store.state.user")
          v-list-item-icon(class="mr-2")
            v-btn(light small fab :color="color")
              v-icon mdi-account
          v-list-item-content
            v-list-item-title(class="caption font-weight-bold") {{ displayName }}
        v-list-item(v-else)
          v-list-item-content
            v-btn(large outlined :color="color" to="/account/register" nuxt) Sign in
        //- Divider color is the same as 'blue-grey darken-2' from Material Color Palette
        v-divider(style="background-color: #455A64 !important;")
        //- Navigation links
        v-list-item-group(:color="color")
          v-list-item
            v-list-item-content
              v-list-item-title My dashboard
          v-list-item
            v-list-item-content
              v-list-item-title My plans
          v-list-item
            v-list-item-content
              v-list-item-title My calendar
          v-list-item(v-if="this.$store.state.user" @click="visibility.planCreationForm = true")
            template(v-slot:default="{ active, toggle }")
              v-list-item-content
                v-list-item-title Create a plan
              v-dialog(persistent no-click-animation :value="visibility.planCreationForm" max-width=800)
                plan-creation-form(@close="visibility.planCreationForm = false; toggle();")
    v-content
      nuxt
</template>

<script>
import planCreationForm from '~/components/planCreationForm';
export default {
  components: {
    planCreationForm
  },

  data () {
    return {
      visibility: {
        planCreationForm: false
      }
    };
  },

  computed: {
    displayName () {
      const user = this.$store.state.user;
      return (user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : user.email;
    },
    color () {
      return this.$store.state.color;
    }
  },

  mounted () {
    // Update state with data from localStorage
    if (localStorage.getItem('token')) {
      this.$store.commit('setToken', localStorage.getItem('token'));
    }
    if (localStorage.getItem('user')) {
      this.$store.commit('setUser', JSON.parse(localStorage.getItem('user')));
    }
  }
};
</script>
