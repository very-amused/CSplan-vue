<template lang="pug">
div(class="container")
  b-button(@click="addCategory" class="add-button" type="is-light")
    b-icon(icon="plus")
  category(v-for="(cat, index) in categories" :index="index" :key="cat.id")
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
  },

  methods: {
    async addCategory () {
      await this.$store.dispatch('categories/createCategory');
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.add-button {
  margin-top: 1rem;
  width: 30rem;
}
</style>
