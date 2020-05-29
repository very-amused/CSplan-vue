<template lang="pug">
  div(class="card")
    div(class="card-content" id="content")
      form(action="" onsubmit="return false")
        b-field(label="Title")
          b-input(v-model="fields.title" maxlength=2000 :has-counter="false")
        span(class="label") Items
          b-dropdown(ref="dropdown" @active-change="showItemForm = $event")
            b-button(rounded size="is-small" style="margin-left: 0.5rem;" slot="trigger")
              b-icon(:icon="showItemForm ? 'chevron-up' : 'plus'")

            //- Form to add items
            b-dropdown-item(custom id="itemForm")
              form(action="" onsubmit="return false")
                b-field(grouped custom-class="hide")
                  b-input(v-model="itemFields.title" id="itemFieldTitle" placeholder="Title" expanded)
                  b-dropdown(v-model="itemFields.category")
                    b-button(slot="trigger" :style="`background-color: ${categoryByID(itemFields.category.id)? categoryByID(itemFields.category.id).color.hex : '#FFFFFF'}`") {{ itemFields.category.title || 'No Category' }}
                    b-dropdown-item(v-for="category in categories" :key="category.id" :value="category") {{ category.title }}
                b-field(style="margin-bottom: 0")
                  b-input(v-model="itemFields.description" type="textarea" maxlength=2000 placeholder="Description (optional)")
                b-field
                  b-button(@click="addItem" expanded native-type="submit")
                    b-icon(icon="plus")

        //- List of items
        div(class="column")
          b-taglist(v-for="(item, index) in items" :key="index" class="item-tags")
            b-tag(size="is-medium" :title="item.title") {{ item.title }}
            b-tag(v-if="item.category.id" size="is-small" :style="`background-color: ${categoryByID(item.category.id).color.hex}`") {{ categoryByID(item.category.id).title }}

        //- Submit button
        div(id="submitButtonContainer")
          b-button(@click="addList" native-type="submit" type="is-success" rounded id="submitButton")
            b-icon(icon="plus")
</template>

<script>
export default {
  data () {
    return {
      showItemForm: false,
      fields: {
        title: ''
      },
      items: [],
      itemFields: {
        title: '',
        description: '',
        category: {
          id: null
        }
      }
    };
  },

  computed: {
    categories () {
      return this.$store.state.categories;
    }
  },

  methods: {
    addItem () {
      // Smooth out some HTML validation behavior
      if (!this.itemFields.title.length) {
        document.querySelector('#itemFieldTitle').setCustomValidity('This field is required.');
        return;
      }
      else {
        document.querySelector('#itemFieldTitle').setCustomValidity('');
      }

      this.items.push({
        ...this.itemFields,
        completed: false
      });
      // Clear each field except for the color picker
      this.itemFields.title = this.itemFields.description = '';
      // Close the dropdown
      this.$refs.dropdown.toggle();
    },
    async addList () {
      await this.$store.dispatch('todos/addList', {
        title: this.fields.title,
        items: this.items
      })
        .catch((err) => {
          const httpErr = err.response.data.error;
          this.$buefy.dialog.alert({
            title: httpErr.title || 'Error!',
            message: httpErr.detail || 'An unknown error has occured.',
            type: 'is-danger',
            hasIcon: true,
            icon: 'alert-circle'
          });
        });
      this.$parent.close();
    },
    categoryByID (id) {
      const index = this.$store.state.categories.findIndex(category => category.id === id);
      if (!this.$store.state.categories[index]) {
        return null;
      }
      return this.$store.state.categories[index];
    }
  }
};
</script>

<style scoped>
/* Custom sizing and spacing for forms */
#itemForm {
  min-width: 30rem;
}
@media screen and (min-width: 1200px) {
  .card {
    min-height: 30rem;
  }
}
#submitButtonContainer {
  position: absolute;
  bottom: 1rem;
  right: 0;

  display: flex;
  justify-content: center;

  width: 100%;
}
#submitButton {
  width: 95%;
}
</style>

<style scoped lang="scss">
$field-margin: 0.75rem/2;

.color-picker-trigger {
  margin-right: $field-margin;
  margin-left: $field-margin
}

/* Hide empty field label to the left of inputs */
.hide {
  display: none;
}
.field:last-child {
  flex-grow: 0 !important;
}
.item-form-toggle {
  margin-left: 0.5rem;
}

/* Handle tag title overflow */
.tag span {
  max-width: 10rem;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-tags {
  margin-bottom: 0;
}
</style>
