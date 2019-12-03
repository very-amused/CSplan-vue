<template lang="pug">
  v-container(class="d-flex flex-column align-center")
    v-row(class="mt-10")
      v-card(v-bind="card")
        v-img(v-bind="card.content" src="/img/logo.svg" height=300 contain)
      v-card(v-bind="card")
        v-card-title(v-bind="card.content" v-bind:class="card.title.class") Info
        v-card-text(v-bind="card.content" v-bind:class="card.text.class") CHplan is a simple and fast planning and time management system that keeps you in control. Privacy, simplicity, and efficiency are the building blocks of CHplan's core values.
    v-row
      v-card(v-bind:width="2 * card.width" class="mt-5")
        v-expansion-panels
          v-expansion-panel(v-bind:width="2 * card.width" class="expansion-panel")
            v-expansion-panel-header See what you can do with CHplan
            v-expansion-panel-content
              v-divider
              v-card(v-bind="card")
              v-card-title(v-bind="card.content" v-bind:class="card.title.class") Make your plans from anywhere
              v-card-text(v-bind="card.content" v-bind:class="card.text.class") Sample text
</template>

<script>
export default {
  data: () => {
    return {
      card: {
        style: 'border-radius: 0;',
        color: 'light-blue',
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
/* Expansion panel background color is the same as Vuetify's light-blue color,
!important is used to override Vuetify's default styling */
.expansion-panel {
  border-radius: 0 !important;
  background-color: #03a9f4 !important;
}
</style>
