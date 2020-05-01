<template lang="pug">
div(class="card" :style="`background-color: ${category.color.hex}`")
  div(class="card-header")
    b-dropdown(class="palette-icon")
      b-icon(slot="trigger" icon="palette" :style="`color: ${getForegroundColor(category.color.hex)}`")
      b-dropdown-item(custom paddingless)
        client-only
          color-picker(:value="category.color" @input="updateColor($event)" :presetColors="colorsArray" disable-alpha)
    h1(class="title" :style="`color: ${getForegroundColor(category.color.hex)}`" contenteditable @blur="updateTitle($event)") {{ category.title }}
</template>

<script>
import { Sketch } from 'vue-color';
import colors from '~/assets/defs/colors';
export default {
  components: {
    colorPicker: Sketch
  },

  props: {
    index: {
      type: Number,
      default () {
        return 0;
      }
    }
  },

  computed: {
    category () {
      return this.$store.state.categories[this.index];
    },
    colorsArray () {
      return Object.values(colors);
    }
  },

  methods: {
    // Absolutely not my code
    getForegroundColor (color) {
      color = color.hex || color;
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);

      const luminance = [
        0.299 * r,
        0.587 * g,
        0.114 * b
      ].reduce((a, b) => a + b) / 255;

      return luminance < 0.5 ? '#FFFFFF' : '#363636';
    },
    updateTitle (evt) {
      // Disallow empty titles
      if (!evt.target.textContent) {
        evt.target.textContent = 'Untitled';
      }

      this.$store.dispatch('categories/updateTitle', {
        index: this.index,
        title: evt.target.textContent
      });
    },
    updateColor (evt) {
      this.$store.dispatch('categories/updateColor', {
        index: this.index,
        color: evt
      });
    }
  }
};
</script>

<style>
@import '~/assets/css/fixed-dropdown.css';
</style>

<style scoped>
.container {
  display: flex;
  justify-content: center;
}
.card {
  margin-top: 1rem;
}
.card-header {
  padding: 1rem;
}
@media screen and (min-width: 1200px) {
  .card {
    min-width: 30rem;
  }
}
.column {
  display: flex;
  justify-content: center;
}
.palette-icon {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
}
</style>
