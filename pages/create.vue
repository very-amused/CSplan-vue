<template lang="pug">
  v-container(class="d-flex flex-column align-center")
    v-card(v-bind="card" class="mt-5")
      v-card-title(:class="card.title.class") Create a Plan
      v-divider
      v-form
        v-col
          v-text-field(label="Title" :color="color" required)
          v-row
            v-text-field(label="Time" hint="If AM or PM is not specified, this time will be interpreted as 24-hour." v-model="time.value" :error-messages="timeErrors" :color="color" required @change="validateTime")
            v-text-field(label="Date" :color="color" readonly required :value="date" append-icon="fa-calendar-alt" @click:append="toggleDatePicker")
            v-dialog(v-model="showDatePicker" max-width=500)
              v-date-picker(:color="color" v-model="date" :min="today")
                v-icon(class="close-icon" color="white" @click="toggleDatePicker") fas fa-times
          v-textarea(label="Description (optional)" outlined no-resize rows="3" :color="color" class="mb-0")
        v-col(align="center")
          v-btn(large :color="`${color} white--text`" class="mt-0") Create
</template>

<script>
export default {
  data: () => {
    return {
      showDatePicker: false,
      date: null,
      time: {
        value: null,
        format: null,
        isValid: true
      },

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
    timeErrors () {
      if (!this.time.isValid) {
        return 'Invalid time';
      }
      else {
        return null;
      }
    }
  },

  methods: {
    toggleDatePicker () {
      this.showDatePicker = !this.showDatePicker;
    },
    validateTime () {
      // 12 hour time validation
      const twelveHourRegex = new RegExp(/(\d|[01]\d):([012345]\d) ([AaPp][Mm])/);
      // 24 hour time validation
      const twentyFourHourRegex = new RegExp(/(\d|[01]\d|2[0123]):([012345]\d)/);
      if (twelveHourRegex.test(this.time.value)) {
        this.time.isValid = true;
        this.time.format = '12H';
      }
      else if (twentyFourHourRegex.test(this.time.value)) {
        this.time.isValid = true;
        this.time.format = '24H';
      }
      else {
        // Adjust time error if the time is invalid
        this.time.isValid = false;
      }
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
