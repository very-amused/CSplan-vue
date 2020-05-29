<template lang="pug">
div(class="page")
  navbar(@show-settings="showSettingsModal = true")
  settings-modal(:active="showSettingsModal" @close="showSettingsModal = false")
  nuxt
</template>

<script>
import navbar from '~/components/navbar';
import settingsModal from '~/components/settings/settingsModal';
export default {
  components: {
    navbar,
    settingsModal
  },

  data () {
    return {
      showSettingsModal: false
    };
  }
};
</script>
