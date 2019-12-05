<template lang="pug">
  v-container(class="d-flex flex-column align-center")
    v-card(v-bind="card" class="mt-5")
      v-card-title(v-bind:class="card.title.class") Create a Plan
      v-divider
      v-form
        v-col
          v-text-field(label="Title" v-bind:color="color" required)
          v-row
            v-text-field(label="Time" v-bind:color="color" required)
            v-text-field(label="Date" v-bind:color="color" readonly required :value="dateVal" append-icon="fa-calendar-alt" @click:append="toggleDatePicker")
            v-dialog(v-model="showDatePicker" max-width=500)
              v-date-picker(v-bind:color="color" v-model="dateVal" v-bind:min="today")
                v-icon(class="close-icon" color="white" @click="toggleDatePicker") fas fa-times
          v-textarea(label="Description (optional)" v-model="timeVal" outlined no-resize rows="3" v-bind:color="color" class="mb-0")
        v-col(align="center")
          v-btn(large v-bind:color="`${color} white--text`" class="mt-0") Create
</template>

<script>
export default {
  data: () => {
    return {
      showDatePicker: false,
      dateVal: null,
      timeVal: null,

      card: {
        class: 'card',
        width: 1000,
        height: 550,
        title: {
          class: 'display-1'
        },
        text: {
          class: 'subtitle-1'
        }
      },

      color: 'indigo darken-1'
    };
  },

  computed: {
    today () {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toISOString();
    },
    dateDisp () {
      return this.dateVal;
    }
  },

  methods: {
    toggleDatePicker () {
      this.showDatePicker = !this.showDatePicker;
    }
  }
};
</script>

<style scoped>
@import '~/assets/card.css';
.close-icon {
  position: absolute;
  right: 1rem;
  top: 1rem;
}
</style>
