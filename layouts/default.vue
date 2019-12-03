<template lang="pug">
  v-app
    v-app-bar(light color="rgb(211, 211, 211)" dense app)
      v-toolbar-title CHplan

      v-btn(text) My dashboard
      v-btn(text) My plans
      v-btn(text) My calendar
      v-btn(text) Create a plan

    v-content
      nuxt
</template>
