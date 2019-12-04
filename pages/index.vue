<template lang="pug">
  v-container(class="d-flex flex-column align-center")
    v-row(class="mt-5")
      v-card(v-bind="card")
        v-img(src="/img/logo.svg" height=300 contain)
      v-card(v-bind="card")
        v-card-title(v-bind:class="card.title.class") Info
        v-card-text(v-bind:class="card.text.class") CHplan is a simple and fast planning and time management system that keeps you in control. Privacy, simplicity, and efficiency are the building blocks of CHplan's core values.
    v-row(class="mt-5")
      v-card(v-bind:width="2 * card.width")
        v-expansion-panels
          v-expansion-panel(v-bind:width="2 * card.width" class="expansion-panel")
            v-expansion-panel-header See what you could do with CHplan
            v-expansion-panel-content
              v-divider
              v-card-title(v-bind:class="card.title.class" class="font-weight-bold") Adapt Yourself to Life's Demands
              v-card-title(v-bind:class="card.title.class") <i class="far fa-calendar-alt mr-2"></i> Stay Organized
              v-card-text(v-bind:class="card.text.class") CHplan was created by busy people, for busy people. As humans, our brains can only hold so much, CHplan can hold the rest.
              v-card-title(v-bind:class="card.title.class") <i class="fas fa-mobile-alt mr-2"></i> Make Your Plans from Anywhere
              v-card-text(v-bind:class="card.text.class") With planned support for desktop, mobile (iOS and Android), and integration with messaging services (Discord, Twitter, and Slack), portability is not an afterthought.
              v-card-title(v-bind:class="card.title.class") <i class="fas fa-lock mr-2"></i> Stay in Control of What Belongs to You
              v-card-text(v-bind:class="card.text.class") CHplan always stores your plans using top of the line AES 256-bit encryption. The key for decrypting your plans is only stored on your side, so nobody can read your plans but you.
</template>

<script>
export default {
  data: () => {
    return {
      card: {
        class: 'card',
        width: 400,
        title: {
          class: 'ml-0 display-1'
        },
        text: {
          class: 'ml-0 subtitle-1'
        }
      }
    }
  }
}
</script>

<style scoped>
/* !important is used to override Vuetify's default styling */
.card {
  border-radius: 0 !important;
  background-color: #00BFFF !important;
}
/* Same as applying ma-5 class to all content inside of cards */
.card * {
  margin: 20px;
}
/* Expansion panel background color is the same as Vuetify's light-blue color */
.expansion-panel {
  border-radius: 0 !important;
  background-color: #00BFFF !important;
}
</style>
