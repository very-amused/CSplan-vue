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
            b-dropdown-item(custom id="itemForm")
              form(action="" onsubmit="return false")
                b-field(grouped custom-class="hide")
                  b-dropdown
                    b-button(slot="trigger" class="color-picker-trigger" rounded :style="`background-color: ${itemFields.color.hex}`")
                    b-dropdown-item(custom paddingless)
                      color-picker(v-model="itemFields.color" :presetColors="colorsArray" disable-alpha)
                  b-input(v-model="itemFields.title" id="itemFieldTitle" placeholder="Title" expanded)
                b-field
                  b-input(v-model="itemFields.description" type="textarea" placeholder="Description (optional)")
                b-field
                  b-button(@click="addItem" native-type="submit")
                    b-icon(icon="plus")
        div(class="column")
          b-taglist(v-for="(item, index) in items" :key="index" attached class="item-tags")
            b-tag(size="is-medium" :title="item.title") {{ item.title }}
            b-tag(size="is-medium" :style="`background-color: ${item.color}`")
        div(id="submitButtonContainer")
          b-button(@click="addList" native-type="submit" type="is-success" rounded id="submitButton")
            b-icon(icon="plus")
</template>

<script>
import { Sketch } from 'vue-color';
import colors from '~/assets/defs/colors';
export default {
  components: {
    colorPicker: Sketch
  },

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
        color: {
          hex: '#002cff'
        }
      }
    };
  },

  computed: {
    colorsArray () {
      return Object.values(colors);
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
        color: this.itemFields.color.hex,
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
