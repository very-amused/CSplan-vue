<template lang="pug">
b-button(@click="$emit('click')" @mousedown.native="hold()" @mouseup.native="release" @mouseout.native="release")
  b-icon(:icon="icon")
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      default () {
        return 'circle';
      }
    }
  },

  data () {
    return {
      timeout: null,
      pressed: false
    };
  },

  methods: {
    hold (delay = 300) {
      this.timeout = setTimeout(() => {
        this.$emit('click');
        this.hold(50);
      }, delay);
    },
    release () {
      clearTimeout(this.timeout);
    }
  }
};
</script>
