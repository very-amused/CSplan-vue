<template lang="pug">
    div(class="card")
      div(class="content-custom")

        //- Delete button
        b-button(@click="openDeleteDialog" type="is-text" size="is-small" class="close-button")
          b-icon(icon="close" class="delete-icon")

        header(class="title is-3" contenteditable @blur="preventEmpty($event); setTitle($event)") {{ list.title }}
        hr
        div(v-for="(item, index) in list.items" :key="item.id" class="media")

          //- Left content
          figure(class="media-left")
            template(v-if="item.completed")
              b-button(@click="toggleCompletion(index)" rounded type="is-text" :style="`background-color: ${categoryByID(item.category.id) ? categoryByID(item.category.id).color.hex : '#FFFFFF'}; color: ${categoryByID(item.category.id) ? getForegroundColor(categoryByID(item.category.id).color.hex) : '#000000'}`")
                b-icon(icon="check")
            template(v-else)
              b-button(@click="toggleCompletion(index)" rounded type="is-grey" outlined)

          //- Item content
          article(class="media-content")
            p(:id="`title-${index}-${id}`" @blur="preventEmpty($event)" class="has-text-weight-bold" type="is-text" :contenteditable="item.editable" placeholder="Untitled" @keydown.enter="toggleEditable(index)") {{ item.title }}
            p(:id="`description-${index}-${id}`" :contenteditable="item.editable" placeholder="Description...") {{ item.description }}
            b-tag(v-if="categoryByID(item.category.id)" :style="`background-color: ${categoryByID(item.category.id).color.hex}; color: ${getForegroundColor(categoryByID(item.category.id).color.hex)}`") {{ categoryByID(item.category.id).title }}

          //- Right content
          figure(class="media-right" :style="item.editable ? 'display: flex !important' : ''")
            b-button(@click="toggleEditable(index)" rounded type="is-text" :style="(item.editable && categoryByID(item.category.id)) ? `background-color: ${categoryByID(item.category.id).color.hex}; color: ${getForegroundColor(categoryByID(item.category.id).color.hex)}` : ''")
              b-icon(icon="pencil" size="is-small")
            b-button(@click="removeItem(index)" rounded type="is-text")
              b-icon(icon="close" size="is-small")

      hr(v-if="list.items.length > 0" style="margin-bottom: 0")
      form(action="" onsubmit="return false" class="item-form")
        template(v-if="!showForm")
          b-button(@click="showForm = true" type="is-grey" outlined expanded)
            b-icon(icon="plus")

        //- Form to add an item
        template(v-else)
          b-button(class="form-close" @click="showForm = false" type="is-text")
            b-icon(icon="close")
          b-field
            b-input(v-model="formInputs.title" placeholder="Title" required)
          b-field(grouped)
            //- Category chooser
            b-dropdown(v-model="formInputs.category")
              b-button(slot="trigger" class="color-picker-trigger") {{ formInputs.category.title || 'No Category' }}
              b-dropdown-item(v-for="category in categories" :key="category.id" :value="category") {{ category.title }}
            b-input(v-model="formInputs.description" placeholder="Description (optional)" expanded)
          b-button(@click="addItem" type="is-primary" native-type="submit" expanded)
            b-icon(icon="plus")
</template>

<script>
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
    }
  },

  data () {
    return {
      showForm: false,
      formInputs: {
        title: '',
        description: '',
        category: {
          id: null
        }
      }
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
    }
  },

  async mounted () {
    await this.$store.dispatch('categories/getCategories');
  },

  methods: {
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
      this.$buefy.dialog.confirm({
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
      const description = document.querySelector(`#description-${index}-${this.id}`).textContent;

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
    }
  }
};
</script>

<style>
.card .media:not(:last-child) {
  margin-bottom: 0;
}
.title {
  margin-bottom: 0 !important;
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
</style>

<style lang="scss" scoped>
$button-width: 34px;
$field-margin: 0.75rem;

.card {
  display: flex;
  flex-direction: column;
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
.color-indicator {
  padding: 1.5px;
  margin: 0.25rem 0;
}
.color-picker-trigger {
  margin-right: $field-margin;
  margin-left: $field-margin
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
p {
  word-break: break-all;
}

.close-button {
  position: absolute;
  top: $field-margin/2;
  right: $field-margin/2;
}
</style>
