<template lang="pug">
  client-only
    b-tabs(v-model="tabIndex" vertical type="is-toggle")
      b-tab-item(v-for="(list, index) in lists" :key="list.id" :label="`${index + 1}. ${list.title || 'Untitled'}`")
        list(:id="list.id")
      key-listener(@keyup="changeTab")
</template>

<script>
import list from './list';
import keyListener from '~/components/keyListener';
export default {
  components: {
    keyListener,
    list
  },

  data () {
    return {
      tabIndex: 0
    };
  },

  computed: {
    lists () {
      console.log(this.$store.state.todos);
      return this.$store.state.todos;
    }
  },

  methods: {
    changeTab (evt) {
      const { key } = evt;
      if ([ ...Array(10).keys() ].includes(parseInt(key))) {
        this.tabIndex = key === 0 ? 10 : key - 1;
      }
    }
  }
};
</script>

<style scoped>
.b-tabs {
  margin-top: 1rem;
}
</style>
