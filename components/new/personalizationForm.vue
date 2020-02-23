<template lang="pug">
  div(class="card")
    div(class="card-content")
      div(class="media")
        figure(class="media-left")
          b-icon(id="icon" icon="account-circle" custom-class="avatar-icon")
        div(class="media-content")
          b-field
            b-input(placeholder="First Name (optional)")
          b-field
            b-input(placeholder="Last Name (optional)")
          b-button(id="submitButton" type="is-success" icon-right="arrow-right") Next
</template>

<style scoped>
.card {
  min-width: 40rem;
}
</style>

<style lang="scss">
/* Custom SCSS for adjusting the avatar's icon size to 64x64
(max size permitted by Bulma defaults is 24x24 */
$avatar-size: 64px;

.media-left {
  width: $avatar-size;
  height: $avatar-size;
  display: flex;
  justify-content: center;
  align-items: center;
}
.avatar-icon::before {
  font-size: $avatar-size !important;
}
</style>
