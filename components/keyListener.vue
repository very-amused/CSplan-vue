<template lang="pug">
div
</template>

<script>
export default {
  mounted () {
    window.addEventListener('keyup', this.handler);
  },

  beforeDestroy () {
    window.removeEventListener('keyup', this.handler);
  },

  methods: {
    handler (evt) {
      this.$emit('keyup', evt);
    }
  }
};
</script>
