<template lang="pug">
div(class="container")
  b-button(@click="addCategory" class="add-button" type="is-light")
    b-icon(icon="plus")
  category(v-for="(cat, index) in categories" :index="index" :key="cat.id")
</template>

<script>
import { mapState } from 'vuex';
import category from '~/components/categories/category';
export default {
  components: {
    category
  },

  computed: {
    ...mapState({
      categories: state => state.categories,
      isLoggedIn: state => state.user.isLoggedIn
    })
  },

  async mounted () {
    if (this.isLoggedIn) {
      await this.$store.dispatch('categories/getCategories');
    }
    else {
      this.$router.replace('/');
    }
  },

  methods: {
    async addCategory () {
      await this.$store.dispatch('categories/createCategory');
    }
  }
};
</script>

<style lang="scss" scoped>
$mobile-breakpoint: 35rem;
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.add-button {
  margin-top: 1rem;
  @media screen and (min-width: $mobile-breakpoint) {
    width: 30rem;
  }
  @media screen and (max-width: $mobile-breakpoint) {
    width: 10rem;
  }
}
</style>
