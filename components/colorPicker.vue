<template lang="pug">
  v-col(align="center" class="bottom")
    v-card(width=190 flat color="blue-grey darken-3")
      span {{ color }}
      //- Accent colors
      v-row(justify="center")
        v-btn(fab class="xx-small mx-1 my-2" v-for="color in colors" :key="color" :color="color" @click="setColor(color)")
          v-icon(v-if="color === storedColor" color="white") far fa-circle
</template>

<script>
export default {
  data () {
    return {
      colors: ['#3D5AFE', '#00E676', '#FF3D00', '#FF1744']
    };
  },

  computed: {
    storedColor () {
      return this.$store.state.color;
    }
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
