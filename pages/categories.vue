<template lang="pug">
div(class="container")
  category(v-for="(cat, index) in categories" :index="index" :body="cat")
</template>

<script>
import category from '~/components/categories/category';
export default {
  components: {
    category
  },

  computed: {
    categories () {
      return this.$store.state.categories;
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
}
</style>
