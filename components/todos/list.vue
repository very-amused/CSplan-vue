<template lang="pug">
div(class="card" :id="`list-${this.id}`")
  div(class="content-custom")

    //- Delete button
    div(class="corner-icons" v-show="!keyboardMode")
      b-button(@click="openDeleteDialog" type="is-text" size="is-small")
        b-icon(icon="close")

    header(:id="`title-${id}`" @keydown.enter="unfocus(`title-${id}`)" class="title is-3" contenteditable @blur="preventEmpty($event); setTitle($event)") {{ list.title }}
    hr
    div(v-for="(item, index) in list.items" :key="index" class="media" @mouseover="select(index)")

      //- Left content
      figure(class="media-left")
        template(v-if="item.completed")
          b-button(@click="toggleCompletion(index)" rounded type="is-text" :style="`background-color: ${categoryByID(item.category.id) ? categoryByID(item.category.id).color.hex : '#FFFFFF'}; color: ${categoryByID(item.category.id) ? getForegroundColor(categoryByID(item.category.id).color.hex) : '#000000'}`")
            b-icon(icon="check")
        template(v-else)
          b-button(@click="toggleCompletion(index)" rounded type="is-grey" outlined)

      //- Item content
      article(class="media-content")
        p(:id="`title-${index}-${id}`" @blur="preventEmpty($event)" class="has-text-weight-bold" :style="(keyboardMode && index === selected) ? 'text-decoration: underline' : ''" :contenteditable="item.editable" placeholder="Untitled" @keydown.enter="toggleEditable(index)") {{ item.title }}
        //- Description rendered by marked (show the raw description if it's editable)
        p(class="content markdown" :id="`description-${index}-${id}`" :contenteditable="item.editable" placeholder="Description... (you can use markdown here)" :class="{'markdown-editor': item.editable}" v-html="item.editable ? breaked(item.description) : marked(item.description)")
        //- Category chooser
        b-dropdown(v-if="item.editable" @active-change="updateCategory(index, $event)" @input="updateCategory($event, index)")
          b-button(slot="trigger" class="color-picker-trigger" :style="categoryByID(item.category.id) ? `background-color: ${categoryByID(item.category.id).color.hex}; color: ${getForegroundColor(item.category.id)}` : ''") {{ categoryByID(item.category.id) && categoryByID(item.category.id).title || 'No Category' }}
          b-dropdown-item(:value="{id: null}") No Category
          b-dropdown-item(v-for="category in categories" :key="category.id" :value="category") {{ category.title }}
        b-tag(v-if="!item.editable && categoryByID(item.category.id)" :style="`background-color: ${categoryByID(item.category.id).color.hex}; color: ${getForegroundColor(categoryByID(item.category.id).color.hex)}`") {{ categoryByID(item.category.id).title }}

      //- Right content
      figure(class="media-right" v-show="!keyboardMode" :style="(item.editable && !keyboardMode) ? 'display: flex !important' : ''")
        b-button(@click="toggleEditable(index)" rounded type="is-text" :style="(item.editable && categoryByID(item.category.id)) ? `background-color: ${categoryByID(item.category.id).color.hex}; color: ${getForegroundColor(categoryByID(item.category.id).color.hex)}` : ''")
          b-icon(icon="pencil" size="is-small")
        b-button(@click="removeItem(index)" rounded type="is-text")
          b-icon(icon="close" size="is-small")

  hr(v-if="list.items.length > 0 && !keyboardMode" style="margin-bottom: 0")
  form(action="" onsubmit="return false" class="item-form")
    template(v-if="!showForm")
      b-button(v-show="!keyboardMode" @click="showForm = true" type="is-grey" outlined expanded)
        b-icon(icon="plus")

    //- Form to add an item
    form(v-else onsubmit="return false")
      b-button(v-show="!keyboardMode" class="form-close" @click="showForm = false" type="is-text")
        b-icon(icon="close")
      b-field(grouped)
        b-input(v-model="formInputs.title" placeholder="Title" expanded required)
        //- Category chooser
        b-dropdown(v-model="formInputs.category")
          b-button(slot="trigger" class="color-picker-trigger") {{ formInputs.category.title || 'No Category' }}
          b-dropdown-item(v-for="category in categories" :key="category.id" :value="category") {{ category.title }}
      //- Buefy is bad at figuring out where the last field is
      b-field(style="margin-bottom: 0")
        b-input(type="textarea" v-model="formInputs.description" placeholder="Description (optional)" expanded maxlength=2000)
      b-button(@click="addItem" type="is-primary" native-type="submit" expanded)
        b-icon(icon="plus")
</template>

<script>
import { DialogProgrammatic as Dialog } from 'buefy';
import marked from 'marked';
import dpurify from 'dompurify';
import { mapActions } from 'vuex';
import colors from '~/assets/defs/colors';
import fgselect from '~/assets/js/fgselect';
export default {
  props: {
    index: {
      type: Number,
      default () {
        return 0;
      }
    },
    id: {
      type: String,
      default () {
        return '';
      }
    },
    active: {
      type: Boolean,
      default () {
        return false;
      }
    }
  },

  data () {
    return {
      saveInterval: null,
      showForm: false,
      formInputs: {
        title: '',
        description: '',
        category: {
          id: null
        }
      },
      selected: 0
    };
  },

  computed: {
    list () {
      return this.$store.state.todos[this.index];
    },
    colorsArray () {
      return Object.values(colors);
    },
    categories () {
      return this.$store.state.categories;
    },
    keyboardMode () {
      return this.$store.state.settings.keyboardMode;
    }
  },

  async mounted () {
    await this.$store.dispatch('categories/getCategories');
    window.addEventListener('keyup', this.handleKeyup);
    // Automatically save every 5s
    this.saveInterval = setInterval(await this.save(this.index), 5000);
  },

  // Clean up everything we did upon mounted before destroying the component
  beforeDestroy () {
    window.removeEventListener('keyup', this.handleKeyup);
    clearInterval(this.saveInterval);
  },

  methods: {
    async handleKeyup (evt) {
      if (!this.active) {
        return;
      }
      // Don't handle keyboard shortcut if an editable element is focused
      const editables = document.querySelectorAll('input, textarea, [contenteditable="true"]');
      for (const el of editables) {
        if (el.contains(document.activeElement)) {
          return;
        };
      }

      // Keyboard shortcuts
      switch (evt.key) {
        case 's': // Save to API
          await this.save(this.index);
          break;
        case 'D': // Delete the entire list
          this.openDeleteDialog();
          break;
        case 'T': // Edit the list's title
          document.querySelector(`#title-${this.id}`).focus();
          break;
        case 'd': // Delete the selected item
          this.removeItem(this.selected);
          break;
        case 'e': // Edit the selected item
          this.toggleEditable(this.selected);
          break;
        case 'c': // Toggle the selected item
          this.toggleCompletion(this.selected);
          break;
        case 'ArrowUp': // Move the selected item up
          this.select(this.selected - 1);
          break;
        case 'ArrowDown': // Move the selected item down
          this.select(this.selected + 1);
          break;
        case 'n': // New item
          this.showForm = true;
          break;
      }
    },
    marked (text) {
      return dpurify.sanitize(marked(text));
    },
    breaked (text) {
      return dpurify.sanitize(text.replace(/\n/g, '<br>'));
    },
    ...mapActions({
      save: 'todos/syncWithAPI'
    }),
    categoryByID (id) {
      const index = this.$store.state.categories.findIndex(category => category.id === id);
      if (!this.$store.state.categories[index]) {
        return null;
      }
      return this.$store.state.categories[index];
    },
    getForegroundColor (color) {
      return fgselect(color);
    },
    openDeleteDialog () {
      Dialog.confirm({
        message: 'Are you sure you want to delete this todo list?',
        confirmText: 'Sure',
        type: 'is-danger',
        onConfirm: async () => {
          await this.$store.dispatch('todos/removeList', this.id);
        }
      });
    },
    async setTitle (evt) {
      await this.$store.dispatch('todos/setTitle', {
        id: this.id,
        title: evt.target.textContent
      });
    },
    preventEmpty (evt) {
      if (evt.target.textContent.length <= 1) {
        evt.target.textContent = 'Untitled';
      }
    },
    async addItem () {
      // Enforce required title field
      if (!this.formInputs.title.length) {
        return;
      }

      try {
        await this.$store.dispatch('todos/addItem', {
          id: this.id,
          item: { ...this.formInputs, category: { id: this.formInputs.category.id }, completed: false }
        });
      }
      catch (err) {
        const message = `An error has occured while trying to add this item to the todo list. ${err.response ? `Error HTTP status: ${err.response.status}` : 'Unknown error status'}`;
        this.$buefy.dialog.alert({
          title: 'Error Adding Item',
          message,
          type: 'is-danger'
        });
      }

      // Clear the form inputs and hide the form after adding the item
      this.formInputs.title = '';
      this.formInputs.description = '';
      this.showForm = false;
    },
    async toggleCompletion (index) {
      await this.$store.dispatch('todos/toggleCompletion', {
        id: this.id,
        itemIndex: index
      });
    },
    toggleEditable (index) {
      // If an edit was made, push them to the state
      if (this.$store.state.todos[this.index].items[index].editable === true) {
        this.updateItem(index);
      }

      this.$store.commit('todos/toggleEditable', {
        index: this.index,
        itemIndex: index
      });
    },
    async updateItem (index) {
      const title = document.querySelector(`#title-${index}-${this.id}`).textContent || 'Untitled';
      // eslint-disable-next-line
      const description = document.querySelector(`#description-${index}-${this.id}`).innerText;

      await this.$store.dispatch('todos/updateItem', {
        index: this.index,
        itemIndex: index,
        item: {
          title,
          description
        }
      });
    },
    async removeItem (index) {
      await this.$store.dispatch('todos/removeItem', {
        id: this.id,
        itemIndex: index
      });
    },
    updateCategory (evt, index) {
      if (evt.id === undefined) {
        return;
      }
      this.$store.dispatch('todos/updateCategory', {
        index: this.index,
        itemIndex: index,
        category: evt
      });
    },
    select (index) {
      if (!this.list.items[index]) {
        return;
      }
      this.selected = index;
    },
    unfocus (id) {
      document.querySelector(`#${id}`).blur();
    }
  }
};
</script>

<style>
.card .media:not(:last-child) {
  margin-bottom: 0;
}
[contenteditable=true][placeholder]:empty:before {
  content: attr(placeholder);
  display: block;
  color: #4A4A4A66
}
[placeholder="Untitled"]:empty:before {
  content: attr(placeholder);
  display: block;
  color: #4A4A4A66
}
.markdown * {
  margin-bottom: 0 !important;
  margin-top: 0 !important;
}
</style>

<style lang="scss" scoped>
$button-width: 34px;
$field-margin: 0.75rem;
$magical-width: 72rem;

.card {
  display: flex;
  flex-direction: column;
  margin-bottom: 0 !important;
}
.title {
  margin-bottom: 0 !important;
}
.chinless {
  margin-bottom: 0 !important;
}
.content-custom {
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 1rem;
  margin-bottom: 0;
}
hr {
  margin-bottom: $field-margin;
  margin-top: $field-margin;
}
.media-right {
  display: none;
}
.media:hover {
  .media-right {
    display: flex;
    flex-direction: row;
  }
}
.item-form {
  padding: 0.75rem;
}
.dropdown-content {
  padding: 0;
}
/* Override button width change when icon is added */
.button.is-rounded {
  width: $button-width !important;
}
.button.form-close {
  margin-bottom: $field-margin;
}
.markdown {
  margin-bottom: 0.25rem !important;
}
// Prevent titles or descriptions of items from overflowing the list
header, p {
  max-width: $magical-width;
  overflow-wrap: break-word;
}
.markdown-editor {
  background-color: whitesmoke;
  padding: 0.75rem;
}

.corner-icons {
  position: absolute;
  top: $field-margin/2;
  right: $field-margin/2;
}
</style>
