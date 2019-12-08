<template lang="pug">
  v-container(class="d-flex flex-column align-center")
    v-card(v-bind="card" class="mt-5")
      v-card-title(:class="card.title.class") Create a Plan
      v-divider
      v-form
        v-col
          v-text-field(label="Title" :color="color" v-model="fields.title"  :error-messages="errors.title" required)
          v-row
            v-text-field(label="Time" hint="If AM or PM is not specified, this time will be interpreted as 24-hour." v-model="fields.time" :error-messages="errors.time" :color="color" required @change="validateTimeFormat")
            v-text-field(label="Date" :color="color" readonly required :value="fields.date" :error-messages="errors.date" append-icon="fa-calendar-alt" @click:append="toggleDatePicker")
            v-dialog(v-model="visibility.datePicker" max-width=500)
              v-date-picker(:color="color" v-model="fields.date" :min="today")
                v-icon(class="close-icon" color="white" @click="toggleDatePicker") fas fa-times
          v-textarea(label="Description (optional)" outlined no-resize rows="3" maxlength=2000 counter v-model="fields.description" :color="color" class="mb-0")
        v-col(align="center")
          v-btn(large :color="`${color} white--text`" class="mt-0" @click="submit") Create
    v-snackbar(color="error" v-model="visibility.snackbar") {{ snackbarContent }}
</template>

<script>
export default {
  data () {
    return {
      // Data concerning showing or hiding elements
      visibility: {
        datePicker: false,
        snackbar: false
      },
      // Data concerning the value of fields
      fields: {
        title: null,
        time: null,
        date: null,
        description: null
      },
      // Data concerning whether the submit button has been pressed
      submitButtonPressed: false,
      // Data concerning validity of fields
      validity: {
        time: true
      },
      // Data concerning formats of fields
      formats: {
        time: {
          isTwentyFourHour: null
        }
      },

      // Data concerning appearance of the form
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
    timestamp () {
      /* Return if the time or date don't exist or are invalid
      (validity of date is assumed because of vuetify's date picker) */
      if (!(this.fields.time && this.fields.date && this.validity.time)) {
        return null;
      }
      // Parse year, month, and date
      const splitDate = this.fields.date.split('-');
      const [year, month, date] = [...splitDate.map(i => parseInt(i))];
      // Split the time for parsing
      const splitTime = this.fields.time(' ')[0].split(':');
      // Parse hours and minutes
      const [hours, minutes] = [...splitTime.map(i => parseInt(i))];
      const dateObj = new Date(year, month - 1, date, hours, minutes);
      // Adjust time if 12 hour time format is being used
      if (!this.formats.time.isTwentyFourHour) {
        if (hours === 12 && this.time.value.toLowerCase().includes('am')) {
          dateObj.setHours(hours - 12);
        }
        else if (hours !== 12 && this.time.value.toLowerCase().includes('pm')) {
          dateObj.setHours(hours + 12);
        }
      }
      // Set the timestamp in Unix epoch time
      return dateObj.getTime();
    },
    // Compute errors for the form
    errors () {
      const errors = {
        title: [],
        time: [],
        date: []
      };
      // Check if time format is valid
      if (!this.validity.time) {
        errors.time.push('Invalid time format.');
      }
      /* If the submit button has been pressed and
      there are required fields empty, prompt the user to fill them */
      if (this.submitButtonPressed) {
        for (const i in this.fields) {
          if (i !== 'description' && !this.fields[i]) {
            errors[i].push('This field is required.');
          }
        }
      }
      return errors;
    }
  },

  methods: {
    toggleDatePicker () {
      this.visibility.datePicker = !this.visibility.datePicker;
    },
    toggleSnackbar () {
      this.visibility.snackbar = !this.visibility.snackbar;
    },
    validateTimeFormat () {
      // 12 hour time validation
      const twelveHourRegex = new RegExp(/(\d|[01]\d):([012345]\d) ([AaPp][Mm])$/);
      // 24 hour time validation
      const twentyFourHourRegex = new RegExp(/(\d|[01]\d|2[0123]):([012345]\d)$/);
      // Test the provided time against the regex
      if (twelveHourRegex.test(this.fields.time)) {
        this.validity.time = true;
        this.fields.time = this.fields.time.match(twelveHourRegex)[0];
        this.formats.time.isTwentyFourHour = false;
      }
      else if (twentyFourHourRegex.test(this.fields.time)) {
        this.validity.time = true;
        this.fields.time = this.fields.time.match(twentyFourHourRegex)[0];
        this.formats.time.isTwentyFourHour = true;
      }
      else {
        // Mark time field as invalid
        this.validity.time = false;
      }
    },
    async submit () {
      // Mark that the form has been submitted, which causes errors concerning if fields are filled out to be displayed
      this.submitButtonPressed = true;
      // Don't submit the form if there are errors
      for (const i in this.errors) {
        if (this.errors[i].length) {
          return;
        }
      }
      // Post with axios
      await this.$axios.$post('https://07eef260.ngrok.io/API/create-plan', {
        title: this.title.value,
        timestamp: this.timestamp,
        description: this.description
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
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
.creation-message {
  position: absolute;
  bottom: 0;
  /* The missing 0.1% is the pixel that lines the banner up
  with the parent card after animation */
  left: -99.9%;
  border-radius: 0 !important;
}
</style>
