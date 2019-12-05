<template lang="pug">
  v-app
    v-app-bar(dark color="indigo darken-1" dense app)
      v-toolbar-title CHplan
      v-divider(dark vertical class="ml-3")

      v-btn(text class="font-weight-regular") My dashboard
      v-btn(text class="font-weight-regular") My plans
      v-btn(text class="font-weight-regular") My calendar
      v-btn(text class="font-weight-regular" nuxt to="/create") Create a plan

    v-content
      nuxt
</template>
