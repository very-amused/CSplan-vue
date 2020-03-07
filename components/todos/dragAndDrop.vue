<template lang="pug">
  div(class="todo-container")
    todo-list
</template>

<script>
import todoList from '~/components/todos/list';
export default {
  components: {
    todoList
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
