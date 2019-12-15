<template lang="pug">
  v-col(align="center" class="bottom")
    v-card(width=190 flat color="blue-grey darken-3")
      span {{ color }}
      //- Accent colors
      v-row(justify="center")
        v-btn(fab class="xx-small mx-1 my-2" v-for="color in colors.accent" :key="color" :color="color" @click="setColor(color)")
</template>

<script>
export default {
  data () {
    return {
      colors: {
        // indigo accent-3, green accent-3, deep-orange accent-3, red accent-3
        accent: ['#3D5AFE', '#00E676', '#FF3D00', '#FF1744']
      }
    };
  },

  methods: {
    setColor (color) {
      localStorage.setItem('accent-color', color);
      this.$store.commit('update', color);
    }
  }
};
</script>

<style scoped>
.bottom {
  position: absolute;
  bottom: 1rem;
}
.xx-small {
  height: 24px;
  min-width: 24px;
}
</style>
