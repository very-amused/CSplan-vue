<template lang="pug">
  v-container(class="d-flex flex-column align-center")
    v-card(width=800 color="blue-grey darken-4" flat tile)
      v-img(src="/img/logo.svg" class="mx-5" height=250 contain)
      v-divider
      v-card-subtitle(class="white--text") CSplan is a time management system that keeps you in control. Create a free account to reclaim your time with privacy, simplicity, and efficiency.
</template>

<script>
export default {
  data () {
    return {
      card: {
        class: 'card',
        width: 400,
        title: {
          class: 'ml-0 display-1'
        },
        text: {
          class: 'ml-0 subtitle-1'
        }
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
