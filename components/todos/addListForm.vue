<template lang="pug">
  div(class="card")
    div(class="card-content" id="content")
      form
        b-field(label="Title")
          b-input(v-model="fields.title" maxlength=2000 :has-counter="false")
        span(class="label") Items
          b-dropdown(ref="dropdown" @active-change="showItemForm = $event")
            b-button(rounded size="is-small" style="margin-left: 0.5rem;" slot="trigger")
              b-icon(:icon="showItemForm ? 'chevron-up' : 'plus'")
            b-dropdown-item(custom id="itemForm")
              form(action="" onsubmit="return false;")
                b-field(horizontal custom-class="hide")
                  b-input(v-model="itemFields.title" id="itemFieldTitle" placeholder="Title" expanded)
                  b-input(v-model="itemFields.color" type="color")
                b-field
                  b-input(v-model="itemFields.description" type="textarea" placeholder="Description (optional)")
                b-field
                  b-button(@click="addItem" native-type="submit")
                    b-icon(icon="plus")
        b-taglist
          b-taglist(v-for="(item, index) in items" :key="index" attached)
            b-tag(size="is-medium" :title="item.title") {{ item.title }}
            b-tag(size="is-medium" :style="`background-color: ${item.color}`")
        div(id="submitButtonContainer")
          b-button(@click="addList" type="is-success" rounded id="submitButton")
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
        color: '#002cff'
      }
    };
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

      this.items.push({ ...this.itemFields, completed: false });
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
.card {
  min-height: 30rem;
}
#itemForm {
  min-width: 30rem;
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

<style lang="scss">
$color-selector-margin: 1.5rem;

/* Hide empty field label to the left of inputs */
.hide {
  display: none;
}
input[type="color"] {
  margin-right: $color-selector-margin;
  margin-left: $color-selector-margin/2;
  width: $color-selector-margin*2;
}
.field:last-child {
  flex-grow: 0 !important;
}
.item-form-toggle {
  margin-left: 0.5rem;
}

/* Fix some inconsistencies with the default tag spacing */
.tags {
  margin-bottom: 1rem !important;
}
.tags:not(:last-child) {
  margin-right: 0.5rem;
}

/* Handle tag title overflow */
.tag span {
  max-width: 10rem;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
