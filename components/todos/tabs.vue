<template lang="pug">
  b-tabs(v-model="tabIndex" vertical type="is-toggle")
    b-tab-item(v-for="(list, index) in lists" :key="list.id" :label="`${index + 1}. ${list.title || 'Untitled'}`")
      list(:id="list.id" :title="list.title" :items="list.items" @update="update(list.id)")
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
      tabIndex: 0,
      lists: [
        {
          id: '1234',
          title: 'something dude',
          items: [
            {
              title: 'bruh',
              completed: false
            }
          ]
        },
        {
          id: '123789132'
        }
      ]
    };
  },

  methods: {
    changeTab (evt) {
      const { key } = evt;
      if ([ ...Array(10).keys() ].includes(parseInt(key))) {
        this.tabIndex = key === 0 ? 10 : key - 1;
      }
    },
    /**
     * @param {string} id - The list's ID
     */
    update (id) {
      const { title, items } = this.lists.find(list => list.id === id);
      // Cache the list that has been updated
      localStorage.setItem(`list-${id}`, JSON.stringify({
        id,
        title,
        items
      }));
    }
  }
};
</script>

<style scoped>
.b-tabs {
  margin-top: 1rem;
}
</style>
