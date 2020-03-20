<template lang="pug">
  div(class="card")
    div(class="card-content")
      form
        b-field(label="Title")
          b-input(maxlength=2000 :has-counter="false")
        span(class="label") Items
          b-button(rounded size="is-small" style="margin-left: 0.5rem;" @click="showItemForm = !showItemForm")
            b-icon(:icon="showItemForm ? 'chevron-up' : 'plus'")
        b-field
          template(v-if="showItemForm")
            form(action="" onsubmit="return false;" name="itemForm")
              b-field(horizontal custom-class="hide")
                b-input(v-model="itemFields.title" id="itemFieldTitle" placeholder="Title" expanded)
                b-input(v-model="itemFields.color" type="color")
              b-field(horizontal custom-class="hide")
                b-input(v-model="itemFields.description" placeholder="Description (optional)")
                b-button(@click="addItem" native-type="submit")
                  b-icon(icon="plus")
        b-taglist
          b-taglist(v-for="item in items" attached)
            b-tag {{ item.title }}
            b-tag(:style="`background-color: ${item.color}`")
        b-button(v-show="!showItemForm" type="is-success" expanded rounded)
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

      this.items.push({ ...this.itemFields });
      // Clear each field except for the color picker
      this.itemFields.title = this.itemFields.description = '';
    }
  }
};
</script>

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
</style>
