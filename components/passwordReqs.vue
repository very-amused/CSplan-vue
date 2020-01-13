<template lang="pug">
  v-card(width=400)
    v-card-title Password Requirements:
    v-divider
    v-list
      v-list-item(v-for="requirement in requirements")
        v-list-item-content
          v-list-item-action-text {{ requirement }}
</template>

<script>
export default {
  data () {
    return {
      requirements: [
        'Must be at least 10 characters in length',
        'Must contain at least one uppercase and one lowercase letter',
        'Must contain at least one number OR one symbol',
        'Choose carefully, the security of all of your plans and account information relies on a strong password'
      ]
    };
  }
};
</script>
