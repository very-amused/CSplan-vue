<template lang="pug">
  v-app
    v-navigation-drawer(permanent width=200 color="blue-grey darken-4" app)
      v-list(nav dark)
        v-list-item
          v-list-item-icon(class="mr-5")
            v-btn(light small fab :color="color")
              v-icon mdi-account
          v-list-item-content
            v-list-item-title Account
        //- Divider color is the same as 'blue-grey darken-2' from Material Color Palette
        v-divider(style="background-color: #455A64 !important;")
        //- Navigation links
        v-list-item-group(color="indigo lighten-1")
          v-list-item
            v-list-item-content
              v-list-item-title My dashboard
          v-list-item
            v-list-item-content
              v-list-item-title My plans
          v-list-item
            v-list-item-content
              v-list-item-title My calendar
          v-list-item(@click="visibility.planCreationForm = true")
            template(v-slot:default="{ active, toggle }")
              v-list-item-content
                v-list-item-title Create a plan
              v-dialog(persistent :value="visibility.planCreationForm" max-width=800)
                plan-creation-form(@close="visibility.planCreationForm = false; toggle();")
      color-picker
    v-content
      nuxt
</template>

<script>
import planCreationForm from '~/components/planCreationForm';
import colorPicker from '~/components/colorPicker';
export default {
  components: {
    planCreationForm,
    colorPicker
  },

  data () {
    return {
      visibility: {
        planCreationForm: false
      }
    };
  },

  computed: {
    color () {
      return this.$store.state.color;
    }
  }
};
</script>
