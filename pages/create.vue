<template lang="pug">
  v-container(class="d-flex flex-column align-center")
    v-card(v-bind="card" class="mt-5")
      v-card-title(:class="card.title.class") Create a Plan
      v-divider
      v-form(lazy-validation)
        v-col
          v-text-field(label="Title" :color="color" required)
          v-row
            v-text-field(label="Time" hint="If AM or PM is not specified, this time will be interpreted as 24-hour." v-model="time.value" :value="time.value" :error-messages="errors" :color="color" required @change="validateTimeFormat")
            v-text-field(label="Date" :color="color" readonly required :value="date" append-icon="fa-calendar-alt" @click:append="toggleDatePicker")
            v-dialog(v-model="showDatePicker" max-width=500)
              v-date-picker(:color="color" v-model="date" :min="today")
                v-icon(class="close-icon" color="white" @click="toggleDatePicker") fas fa-times
          v-textarea(label="Description (optional)" outlined no-resize rows="3" :color="color" class="mb-0")
        v-col(align="center")
          v-btn(large :color="`${color} white--text`" class="mt-0" @click="submit") Create
</template>

<script>
export default {
  data () {
    return {
      showDatePicker: false,
      date: null,
      time: {
        value: null,
        isTwentyFourHour: null,
        isValidFormat: true
      },
      timeDateObject: null,

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
      d.setHours(0);
      d.setMinutes(0);
      d.setSeconds(0);
      return d.toISOString();
      // Returns the current date at midnight (for purposes of the minimum date allowed on the date picker)
    },
    errors () {
      if (!this.time.isValidFormat) {
        return 'Invalid time format.';
      }
      // Ensure timeDateObject exists before calling the getTime method on it
      else if (this.timeDateObject) {
        if (this.timeDateObject.getTime() <= new Date().getTime()) {
          return 'This time has already elapsed.';
        }
      }
      return null;
    }
  },

  watch: {
    // Update the date object (contains information on both time and calendar date)
    date () {
      this.parseTimeDateObject();
    },
    'time.value' () {
      this.parseTimeDateObject();
    }
  },

  methods: {
    toggleDatePicker () {
      this.showDatePicker = !this.showDatePicker;
    },
    validateTimeFormat () {
      // 12 hour time validation
      const twelveHourRegex = new RegExp(/(\d|[01]\d):([012345]\d) ([AaPp][Mm])$/);
      // 24 hour time validation
      const twentyFourHourRegex = new RegExp(/(\d|[01]\d|2[0123]):([012345]\d)$/);
      // Test the provided time against the regex
      if (twelveHourRegex.test(this.time.value)) {
        this.time.isValidFormat = true;
        this.time.value = this.time.value.match(twelveHourRegex)[0];
        this.time.isTwentyFourHour = false;
      }
      else if (twentyFourHourRegex.test(this.time.value)) {
        this.time.isValidFormat = true;
        this.time.value = this.time.value.match(twentyFourHourRegex)[0];
        this.time.isTwentyFourHour = true;
      }
      else {
        // Adjust time error if the time is invalid
        this.time.isValidFormat = false;
        this.time.format = null;
      }
    },
    parseTimeDateObject () {
      // Return if the time or date don't exist or are invalid
      if (!(this.time.value && this.time.isValidFormat && this.date)) {
        return;
      }
      // Parse year, month, and date
      const splitDate = this.date.split('-');
      const [year, month, date] = [...splitDate.map(i => parseInt(i))];
      // Split the time for parsing
      const splitTime = this.time.value.split(' ')[0].split(':');
      // Parse hours and minutes
      const [hours, minutes] = [...splitTime.map(i => parseInt(i))];
      this.timeDateObject = new Date(year, month - 1, date, hours, minutes);
      // Adjust time if 12 hour time format is being used
      if (!this.time.isTwentyFourHour) {
        if (hours === 12 && this.time.value.toLowerCase().includes('am')) {
          this.timeDateObject.setHours(hours - 12);
        }
        else if (hours !== 12 && this.time.value.toLowerCase().includes('pm')) {
          this.timeDateObject.setHours(hours + 12);
        }
      }
    },
    submit () {
      /* Only submit the form if 3 conditions are met:
      1. There has been a time set
      2. There has been a date set
      3. There are no errors in the form */
      if (!(this.time.value && this.date && !this.errors)) {
        return;
      }
      // Post with axios
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
