<template lang="pug">
  client-only
    b-tabs(v-model="tabIndex" vertical type="is-toggle")
      b-tab-item(v-for="(list, index) in lists" :key="list.id" :label="`${index + 1}. ${list.title || 'Untitled'}`")
        list(:id="list.id")
      b-tab-item(id="new-list-tab" icon="plus" label="New List")
      key-listener(@keyup="changeTab")
      b-modal(:active="tabIndex === lists.length" @close="tabIndex -= 1")
        addListForm()
</template>

<script>
import list from './list';
import addListForm from './addListForm';
import keyListener from '~/components/keyListener';
export default {
  components: {
    keyListener,
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
    }
  },

  methods: {
    changeTab (evt) {
      const { key } = evt;
      const strange = [ ...Array(10).keys() ].map(key => key.toString());
      const range = [ ...Array(10).keys() ];

      if (strange.includes(key) && range.includes(parseInt(key))) {
        const index = parseInt(key);
        this.tabIndex = index === 0 ? 10 : index - 1;
      }
    }
  }
};
</script>

<style scoped>
.b-tabs {
  margin-top: 1rem;
}
#addListIcon {
  margin-top: 1rem;
}
</style>
