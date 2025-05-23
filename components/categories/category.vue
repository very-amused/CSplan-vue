<template lang="pug">
div(class="card" :style="`background-color: ${category.color.hex}`")
  div(class="card-header")
    div(class="icons" :style="`${showIcons ? 'display: block !important' : ''}`")
      b-dropdown(@active-change="showIcons = $event; submitColor($event)")
        b-icon(slot="trigger" icon="palette" :style="`color: ${getForegroundColor(category.color.hex)}`")
        b-dropdown-item(custom paddingless)
          client-only
            color-picker(:value="category.color" @input="updateColor($event)" :presetColors="colorsArray" disable-alpha)
      b-button(@click="deleteThis" type="is-text invisible-button")
        b-icon(icon="close" :style="`color: ${getForegroundColor(category.color.hex)}`")
    h1(class="title" :id="`category-title-${category.id}`" :style="`color: ${getForegroundColor(category.color.hex)}`" contenteditable @blur="updateTitle($event)" @keydown.enter="removeFocus") {{ category.title }}
</template>

<script>
import { DialogProgrammatic as Dialog } from 'buefy';
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

  data () {
    return {
      showIcons: false
    };
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
    removeFocus (id) {
      document.querySelector(`#category-title-${this.category.id}`).blur();
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
    updateColor (evt, updateAPI = false) {
      this.$store.dispatch('categories/updateColor', {
        index: this.index,
        color: evt,
        updateAPI
      });
    },
    submitColor (evt) {
      // Submit the color only if the dropdown is closed
      if (!evt) {
        this.$store.dispatch('categories/submitColor', this.index);
      }
    },
    deleteThis () {
      Dialog.confirm({
        title: 'Delete?',
        message: 'Are you sure you want to delete this category?',
        type: 'is-danger',
        hasIcon: true,
        confirmText: 'Sure',
        onConfirm: async () => {
          await this.$store.dispatch('categories/removeCategory', this.index);
        }
      });
    }
  }
};
</script>

<style>
@import '~/assets/css/fixed-dropdown.css';
</style>

<style lang="scss" scoped>
@import '~/assets/css/invisible-button.css';
.container {
  display: flex;
  justify-content: center;
}
.card {
  margin-top: 1rem;
  &:hover .icons {
    display: block !important;
  }
  /* Override hover behavior on mobile */
  @media screen and (max-width: 35rem) {
    .icons {
      display: block !important;
    }
  }
}
.card-header {
  padding: 1rem;
}
@media screen and (min-width: 35rem) {
  .card {
    min-width: 30rem;
  }
}
@media screen and (max-width: 35rem) {
  .card {
    min-width: 10rem;
    margin-left: 1rem;
    margin-right: 1rem;
  }
  .card-header {
    padding-top: 1.5rem;
  }
}
.column {
  display: flex;
  justify-content: center;
}
.icons {
  display: none !important;
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  display: flex;
  flex-direction: row;
}
</style>
