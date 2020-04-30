<template lang="pug">
div
  tabs(:list-form-is-active="showListForm" @new="showListForm = true")
  b-button(@click="showListForm = true" class="add-list-button" type="is-link" size="is-large" rounded)
    b-icon(icon="plus")
  b-modal(:active.sync="showListForm")
    addListForm
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

  async mounted () {
    if (this.$store.state.user.isLoggedIn) {
      await this.$store.dispatch('todos/getLists');
    }
    else {
      // Don't make any API calls if the user isn't authenticated
      this.$router.replace('/');
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
