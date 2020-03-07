<template lang="pug">
  div(class="todo-container")
    div(class="card" v-for="(list, index) in todoLists" :key="index")
      div(class="card-content" draggable="true" :index="index")
        article(class="media-content")
          header(class="title is-3") {{ list.title }}
          hr
          div(v-for="(todo, index) in list.items" class="media" :key="index")
            figure(class="media-left")
              b-button(rounded :type="{'is-primary': todo.completed}" :outlined="!todo.completed")
            article(class="media-content")
              span(class="has-text-weight-bold" type="is-primary") {{ todo.title }}
              br
              span {{ todo.description }}
            figure(class="media-right")
              b-button(@click="removeItem(list, index)" type="is-text")
                b-icon(icon="close" size="is-small")
        hr(v-if="list.items.length > 0")
        form(action="")
          template(v-if="!list.showForm")
            b-button(@click="list.showForm = true" type="is-grey" outlined expanded)
              b-icon(icon="plus")
          template(v-else)
            b-button(@click="list.showForm = false" type="is-text")
              b-icon(icon="close")
            b-field
              b-input(v-model="list.formInputs.title" placeholder="Title" required)
            b-field
              b-input(v-model="list.formInputs.description" placeholder="Description (optional)")
            b-button(@click="addItem(list)" type="is-primary" expanded)
              b-icon(icon="plus")
      hr(class="drop-indicator")
</template>

<script>
export default {
  props: {
    todoLists: {
      type: Array,
      default () {
        return [];
      }
    }
  },

  mounted () {
    document.querySelectorAll('.card-content[draggable=true]').forEach((el) => {
      el.addEventListener('dragstart', this.dragHandler);
      el.addEventListener('dragend', this.dragEndHandler);
    });

    document.querySelectorAll('.card').forEach((el) => {
      el.addEventListener('dragover', (evt) => {
        evt.preventDefault();

        // Add hover CSS to the current drop indicator
        evt.currentTarget.querySelector('.drop-indicator').classList.add('hovered');
        evt.dataTransfer.dropEffect = 'move';
      });

      el.addEventListener('dragleave', (evt) => {
        evt.preventDefault();

        // Remove hover CSS from the drop indicator
        evt.currentTarget.querySelector('.drop-indicator').classList.remove('hovered');
      });

      el.addEventListener('drop', this.dropHandler);
    });
  },

  middleware: 'authenticate',

  methods: {
    dragHandler (evt) {
      const dt = evt.dataTransfer;

      // Highlight drop points
      document.querySelectorAll('.drop-indicator').forEach((el) => {
        el.classList.add('active');
      });

      const index = event.target.getAttribute('index');
      dt.setData('text/plain', index);
      dt.dropEffect = 'move';
    },
    dragEndHandler (evt) {
      document.querySelectorAll('.drop-indicator').forEach((el) => {
        el.classList.remove('active');
        el.classList.remove('hovered');
      });
    },
    dropHandler (evt) {
      const destination = parseInt(evt.currentTarget.querySelector('.card-content').getAttribute('index'));
      const origin = parseInt(evt.dataTransfer.getData('text/plain'));

      const target = [ ...this.todoLists ];

      // The ole switcharoo/most painful thing I think I've ever had to figure out
      if (origin < destination) {
        target.splice(destination + 1, 0, this.todoLists[origin]); // Insert the origin after the destination
        target.splice(origin, 1); // Seek and destroy
      }
      else if (origin > destination) {
        target.splice(destination, 0, this.todoLists[origin]); // Insert the origin before the destination
        target.splice(origin + 1, 1); // Seek and destroy with the frameshifted index of the origin
      }
      this.todoLists = target;
    },
    addItem (list) {
      list.items.push({ ...list.formInputs });
      // Clear the form inputs and hide the formafter adding
      list.formInputs = {
        title: '',
        description: ''
      };
      list.showForm = false;
    },
    removeItem (list, index) {
      console.log(list);
      list.items.splice(index, 1);
    }
  }
};
</script>

<style lang="scss" scoped>
$card-margin: 1rem;
.todo-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}
.card {
  display: flex;
  flex-direction: column;
  min-width: 35%;
  margin-left: $card-margin;
  margin-right: $card-margin;
  margin-top: $card-margin;
}
.drop-indicator {
  margin: 0;
}
.drop-indicator.active {
  background-color: teal;
}
.drop-indicator.active.hovered {
  background-color: blueviolet;
}
</style>
