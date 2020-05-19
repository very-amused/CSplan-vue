<template lang="pug">
client-only
  b-tabs(v-model="tabIndex" type="is-toggle")
    b-tab-item(v-for="(list, index) in lists" :key="list.id" :label="list.title")
      list(:id="list.id" @form-open="listFormIsActive = true" @form-close="listFormIsActive = false")
</template>

<script>
import list from './list';
import addListForm from './addListForm';
export default {
  components: {
    addListForm,
    list
  },

  props: {
    listFormIsActive: Boolean
  },

  data () {
    return {
      tabIndex: 0,
      itemFormIsActive: false
    };
  },

  computed: {
    lists () {
      return this.$store.state.todos;
    }
  },

  mounted () {
    window.addEventListener('keyup', this.changeTab);
  },

  beforeDestroy () {
    window.removeEventListener('keyup', this.changeTab);
  },

  methods: {
    changeTab (evt) {
      if (this.listFormIsActive || this.itemFormIsActive) {
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

      else if (key === 'n') {
        this.$emit('new');
      }
    }
  }
};
</script>

<style scoped>
.b-tabs {
  margin-top: 1rem;
}
.new-list-form-button {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
}
</style>
