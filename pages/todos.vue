<template lang="pug">
  drag-and-drop(:todo-lists="todoLists")
</template>

<script>
import dragAndDrop from '~/components/todos/dragAndDrop';
export default {
  components: {
    dragAndDrop
  },

  data () {
    return {
      todoLists: [
        {
          title: 'Saturday stuff',
          items: [
            {
              title: 'Bruh',
              description: 'Bruh stuff',
              completed: false
            }
          ],
          showForm: false,
          formInputs: {
            title: '',
            description: ''
          }
        }
      ]
    };
  }
};
</script>
