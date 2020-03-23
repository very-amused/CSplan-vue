<template lang="pug">
  client-only
    b-tabs(v-model="tabIndex" vertical type="is-toggle")
      b-tab-item(v-for="(list, index) in lists" :key="list.id" :label="`${index + 1}. ${list.title || 'Untitled'}`")
        list(:id="list.id")
      b-tab-item(id="new-list-tab" icon="plus" label="New List")
      b-modal(:active="tabIndex === addButtonIndex" @close="tabIndex = addButtonIndex - 1")
        addListForm
</template>

<script>
import list from './list';
import addListForm from './addListForm';
export default {
  components: {
    addListForm,
    list
  },

  data () {
    return {
      tabIndex: 0,
      showListForm: false
    };
  },

  computed: {
    lists () {
      return this.$store.state.todos;
    },
    addButtonIndex () {
      return this.$store.state.todos.length;
    }
  },

  mounted () {
    window.addEventListener('keyup', this.changeTab);
  },

  methods: {
    changeTab (evt) {
      // Return if the modal is shown
      if (this.tabIndex === this.addButtonIndex) {
        return;
      }

      const { key } = evt;
      const strange = [ ...Array(10).keys() ].map(key => key.toString());
      const range = [ ...Array(10).keys() ];

      if (strange.includes(key) && range.includes(parseInt(key))) {
        const index = parseInt(key);
        if (index >= this.addButtonIndex) {
          this.tabIndex = this.addButtonIndex - 1;
        }
        else {
          this.tabIndex = index === 0 ? 10 : index - 1;
        }
      }
      // N-key is a shortcut to add an item
      else if (key === 'n') {
        this.tabIndex = this.addButtonIndex;
      }
    }
  }
};
</script>

<style scoped>
.b-tabs {
  margin-top: 1rem;
}
#new-list-tab {
  margin-top: 1rem;
}
</style>
