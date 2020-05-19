<template lang="pug">
div
  section(class="hero is-info is-fullheight" v-if="isEmpty")
    div(class="hero-body")
      div(class="container")
        h1(class="title") Encrypted Todo Lists
        p(class="subtitle") Simple, color coded, fully zero access encrypted. What do you want to do today?
  section(class="container" v-else)
    tabs
  b-button(@click="addList" class="add-list-button" type="is-link" size="is-large" rounded)
    b-icon(icon="plus")
</template>

<script>
import tabs from '~/components/todos/tabs';
import addListForm from '~/components/todos/addListForm';
export default {
  components: {
    tabs,
    addListForm
  },

  data () {
    return {
      showListForm: false
    };
  },

  computed: {
    isEmpty () {
      return !this.$store.state.todos.length;
    }
  },

  async mounted () {
    if (this.$store.state.user.isLoggedIn) {
      await this.$store.dispatch('todos/getLists');
    }
    else {
      // Don't make any API calls if the user isn't authenticated
      this.$router.replace('/');
    }
  },

  methods: {
    async addList () {
      await this.$store.dispatch('todos/addList');
    }
  }
};
</script>

<style scoped>
.add-list-button {
  position: fixed;
  bottom: 4rem;
  right: 4rem;
  width: 5rem;
  height: 5rem;
}
</style>

<style>
/* Plus icon sizing for add todo list button */
.add-list-button > span > span > i::before {
  font-size: 2rem !important;
  margin-top: 1rem !important;
}
</style>
