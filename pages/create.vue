<template lang="pug">
  v-container(class="d-flex flex-column align-center")
    v-card(v-bind="card" class="mt-5")
      v-card-title(:class="card.title.class") Create a Plan
      v-divider
      v-form
        v-col
          v-text-field(label="Title" :color="color" v-model="title.value"  :error-messages="titleErrors" required)
          v-row
            v-text-field(label="Time" hint="If AM or PM is not specified, this time will be interpreted as 24-hour." v-model="time.value" :error-messages="timeErrors" :color="color" required @change="validateTimeFormat")
            v-text-field(label="Date" :color="color" readonly required :value="date" append-icon="fa-calendar-alt" @click:append="toggleDatePicker")
            v-dialog(v-model="showDatePicker" max-width=500)
              v-date-picker(:color="color" v-model="date" :min="today")
                v-icon(class="close-icon" color="white" @click="toggleDatePicker") fas fa-times
          v-textarea(label="Description (optional)" outlined no-resize rows="3" maxlength=2000 counter v-model="description" :color="color" class="mb-0")
        v-col(align="center")
          v-btn(large :color="`${color} white--text`" class="mt-0" @click="submit") Create
</template>

<script>
export default {
  data () {
    return {
      showDatePicker: false,
      // Data concerning the plan creation form, in order of top to bottom, left to right
      title: {
        value: null,
        /* Is the field empty AND the user has tried submitting the form,
        thus prompting the error linked to the truthiness of this variable */
        isEmptyAfterSubmit: false
      },
      time: {
        value: null,
        isValidFormat: true,
        isTwentyFourHour: null
      },
      date: null,
      timestamp: null, // Unix timestamp combining date and time
      description: null,

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
    // Returns the current date at midnight (for purposes of the minimum date allowed on the date picker)
    today () {
      const d = new Date();
      d.setHours(0);
      d.setMinutes(0);
      d.setSeconds(0);
      return d.toISOString();
    },
    titleErrors () {
      if (this.title.isEmptyAfterSubmit) {
        return 'A title is required before this plan can be created';
      }
      return null;
    },
    timeErrors () {
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
      this.parseTimestamp();
    },
    'time.value' () {
      this.parseTimestamp();
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
      }
    },
    parseTimestamp () {
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
      const dateObj = new Date(year, month - 1, date, hours, minutes);
      // Adjust time if 12 hour time format is being used
      if (!this.time.isTwentyFourHour) {
        if (hours === 12 && this.time.value.toLowerCase().includes('am')) {
          dateObj.setHours(hours - 12);
        }
        else if (hours !== 12 && this.time.value.toLowerCase().includes('pm')) {
          dateObj.setHours(hours + 12);
        }
      }
      // Set the timestamp in Unix epoch time
      this.timestamp = dateObj.getTime();
    },
    async submit () {
      // If the user hasn't set a title yet, prompt them to
      if (!this.title) {
        this.title.isEmptyAfterSubmit = true;
        return;
      }
      // Don't submit the form if it's missing a valid timestamp or there are errors with the time
      else if (!(this.timestamp && !this.timeErrors)) {
        return;
      }
      // Post with axios
      const response = await this.$axios.$post('https://07eef260.ngrok.io/API/create-plan', {
        title: this.title.value,
        timestamp: this.timestamp,
        description: this.description
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log(response);
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
