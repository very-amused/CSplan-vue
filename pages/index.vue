<template lang="pug">
  v-container(class="d-flex flex-column align-center")
    v-row(class="mt-5")
      v-card(v-bind="card" color='light-blue')
        v-img(v-bind="card.content" src="/img/logo.svg" height=300 contain)
      v-card(v-bind="card")
        v-card-title(v-bind="card.content" v-bind:class="card.title.class") Info
        v-card-text(v-bind="card.content" v-bind:class="card.text.class") CHplan is a simple and fast planning and time management system that keeps you in control. Privacy, simplicity, and efficiency are the building blocks of CHplan's core values.
    v-row(class="mt-5")
      v-card(v-bind:width="2 * card.width")
        v-expansion-panels
          v-expansion-panel(v-bind:width="2 * card.width" class="expansion-panel")
            v-expansion-panel-header See what you could do with CHplan
            v-expansion-panel-content
              v-divider
              v-card-title(v-bind="card.content" v-bind:class="card.title.class") <i class="far fa-calendar-alt mr-2"></i> Stay organized
              v-card-text(v-bind="card.content" v-bind:class="card.text.class") CHplan was created by busy people, for busy people. As humans our brains can only hold so much, CHplan can hold the rest.
              v-card-title(v-bind="card.content" v-bind:class="card.title.class") <i class="fas fa-mobile-alt mr-2"></i> Make your plans from anywhere
              v-card-text(v-bind="card.content" v-bind:class="card.text.class") With planned support for desktop, mobile (iOS and Android), Discord, Twitter, and Slack, one of CHplan's primary goals is to make sure you can always set a reminder from anywhere.
              v-card-title(v-bind="card.content" v-bind:class="card.title.class") <i class="fas fa-lock mr-2"></i> Stay in control of what belongs to you
              v-card-text(v-bind="card.content" v-bind:class="card.text.class") CHplan always stores your plans using top of the line, AES-256 encryption. The key for decrypting your plans is only stored on your side, so nobody can read your plans but you.
              v-divider
              v-card-title(v-bind="card.content" v-bind:class="card.title.class" class="font-weight-bold") Adapt yourself to life's demands
              v-card-text(v-bind="card.content" v-bind:class="card.text.class") If your life needs more organization, and you want to keep it simple and secure, register your CHplan account today.
</template>

<script>
export default {
  data: () => {
    return {
      card: {
        class: 'card',
        width: 400,
        content: {
          class: 'ma-5'
        },
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
/* Expansion panel background color is the same as Vuetify's light-blue color */
.expansion-panel {
  border-radius: 0 !important;
  background-color: #00BFFF !important;
}
</style>
