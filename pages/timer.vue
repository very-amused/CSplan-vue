<template lang="pug">
div(class="container")
  timer(ref="timer" :size="sizes[size].value")
  div(class="controls")
    b-button(v-for="(s, index) in sizes" :key="s.value" @click="size = index" :type="s.value === sizes[size].value ? 'is-primary' : 'is-text'") {{ s.name }}
</template>

<script>
import timer from '~/components/timer/timer';
export default {
  components: {
    timer
  },

  data () {
    return {
      size: 1,
      sizes: [
        {
          name: 'Small',
          value: 5
        },
        {
          name: 'Medium',
          value: 8
        },
        {
          name: 'Large',
          value: 12
        }
      ]
    };
  }
};
</script>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 60vh;
}
.controls {
  position: fixed;
  bottom: 5rem;
  /* Hide size controls on mobile (where they aren't functional anyway) */
  @media screen and (max-width: 1200px) {
    display: none;
  }
}
</style>
