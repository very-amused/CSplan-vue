<template lang="pug">
div(class="container")
  timer(ref="timer" :size="sizes[size].value" :sound="sounds[sound]")
  div(class="controls")
    section(class="group")
      b-button(v-for="(s, index) in sizes" :key="s.value" @click="size = index" :type="size === index ? 'is-primary' : 'is-text'") {{ s.name }}
    section(class="group")
      b-button(v-for="(n, index) in sounds" :key="n.mp3" @click="sound = index" :type="sound === index ? 'is-primary' : 'is-text'") {{ n.name }}
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
      sound: 0,
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
      ],
      sounds: [
        {
          name: 'Microwave',
          mp3: 'microwave.mp3'
        },
        {
          name: 'Pink Noise',
          mp3: 'pink_noise.mp3'
        },
        {
          name: 'Japanese Bruh Sound Effect',
          mp3: 'bruh.mp3'
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
  .group {
    margin-top: 1.5rem;
  }
}
.controls {
  position: fixed;
  bottom: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  .group {
    flex-direction: row;
  }
  /* Hide size controls on mobile (where they aren't functional anyway) */
  @media screen and (max-width: 1200px) {
    display: none;
  }
}
</style>
