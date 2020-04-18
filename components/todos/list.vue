<template lang="pug">
    div(class="card")
      div(class="card-content")
        article(class="media-content")
          header(class="title is-3") {{ list.title }}
          hr
          div(v-for="(item, index) in list.items" :key="item.id" class="media")
            figure(class="media-left")
              template(v-if="item.completed")
                b-button(@click="toggleCompletion(index)" rounded type="is-primary")
                  b-icon(icon="check")
              template(v-else)
                b-button(@click="toggleCompletion(index)" rounded type="is-grey" outlined)
            article(class="media-content")
              p(class="has-text-weight-bold" type="is-primary") {{ item.title }}
              p {{ item.description }}
            figure(class="media-right")
              b-button(@click="removeItem(index)" type="is-text")
                b-icon(icon="close" size="is-small")
        hr(v-if="list.items.length > 0")
        form(action="" onsubmit="return false")
          template(v-if="!showForm")
            b-button(@click="openForm" type="is-grey" outlined expanded)
              b-icon(icon="plus")
          template(v-else)
            b-button(class="form-close" @click="closeForm" type="is-text")
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
        return '0';
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

  computed: {
    list () {
      const index = this.$store.state.todos.findIndex(list => list.id === this.id);
      return this.$store.state.todos[index];
    }
  },

  methods: {
    openForm () {
      this.$emit('form-open');
      this.showForm = true;
    },
    closeForm () {
      this.$emit('form-close');
      this.showForm = false;
    },
    async addItem () {
      // Enforce required title field
      if (!this.formInputs.title.length) {
        return;
      }

      try {
        await this.$store.dispatch('todos/addItem', {
          axios: this.$axios,
          id: this.id,
          item: { ...this.formInputs, color: '#FFFFFF', completed: false }
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
      this.formInputs = {
        title: '',
        description: ''
      };
      this.showForm = false;
    },
    async toggleCompletion (index) {
      await this.$store.dispatch('todos/toggleCompletion', {
        id: this.id,
        itemIndex: index
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

<style lang="scss" scoped>
$button-width: 34px;
$field-margin: 0.75rem;

.card {
  display: flex;
  flex-direction: column;
  margin-left: 0.5rem;
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
</style>
