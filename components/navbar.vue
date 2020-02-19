<template lang="pug">
  b-navbar(type="is-dark")
    template(slot="start")
      b-navbar-item(tag="nuxt-link" to="/") Dashboard
      b-navbar-item(tag="nuxt-link" to="/") Todos
      b-navbar-item(tag="nuxt-link" to="/") Calendar
    template(slot="end")
      b-navbar-item(tag="div")
        div(class="buttons")
          b-button(type="is-light" rounded) Register
          b-button(type="is-primary" rounded) Log in
</template>
