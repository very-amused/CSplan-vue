<template lang="pug">
    div(class="card")
      div(class="card-content" draggable="true")
        article(class="media-content")
          header(class="title is-3") {{ title }}
          hr
          div(v-for="(item, index) in items" :key="item.id" class="media")
            figure(class="media-left")
              template(v-if="item.completed")
                b-button(@click="toggleCompletion(index)" rounded type="is-primary")
                  b-icon(icon="check")
              template(v-else)
                b-button(@click="toggleCompletion(index)" rounded type="is-grey" outlined)
            article(class="media-content")
              span(class="has-text-weight-bold" type="is-primary") {{ item.title }}
              br
              span {{ item.description }}
            figure(class="media-right")
              b-button(@click="removeItem(index)" type="is-text")
                b-icon(icon="close" size="is-small")
        hr(v-if="items.length > 0")
        form(action="")
          template(v-if="!showForm")
            b-button(@click="showForm = true" type="is-grey" outlined expanded)
              b-icon(icon="plus")
          template(v-else)
            b-button(class="form-close" @click="showForm = false" type="is-text")
              b-icon(icon="close")
            b-field
              b-input(v-model="formInputs.title" placeholder="Title" required)
            b-field
              b-input(v-model="formInputs.description" placeholder="Description (optional)")
            b-button(@click="addItem" type="is-primary" native-type="submit" expanded)
              b-icon(icon="plus")
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      default () {
        return 0;
      }
    },
    title: {
      type: String,
      default () {
        return 'Untitled List';
      }
    },
    items: {
      type: Array,
      default () {
        return [];
      }
    }
  },

  data () {
    return {
      showForm: false,
      formInputs: {
        title: '',
        description: ''
      }
    };
  },

  methods: {
    async addItem () {
      // Enforce required title field
      if (!this.formInputs.title.length) {
        return;
      }

      this.items.push({ ...this.formInputs, completed: false });
      await this.$emit('update');
      // Clear the form inputs and hide the form after adding the item
      this.formInputs = {
        title: '',
        description: ''
      };
      this.showForm = false;
    },
    async toggleCompletion (index) {
      this.items[index].completed = !this.items[index].completed;
      await this.$emit('update');
    },
    async removeItem (index) {
      this.items.splice(index, 1);
      await this.$emit('update');
    }
  }
};
</script>

<style lang="scss" scoped>
$card-margin: 1rem;
$button-width: 34px;
$field-margin: 0.75rem;

.card {
  display: flex;
  flex-direction: column;
  min-width: 35%;
  margin-left: $card-margin;
  margin-right: $card-margin;
  margin-top: $card-margin;
}
/* Override button width change when icon is added */
.button.is-rounded {
  width: $button-width !important;
}
.button.form-close {
  margin-bottom: $field-margin;
}
</style>
