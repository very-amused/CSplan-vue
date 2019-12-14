<template lang="pug">
  v-card
    v-icon(class="close-icon" color="blue-grey darken-4" @click="$emit('close')") fas fa-times
    v-card-title(class="pl-5") Create a Plan
    v-divider
    v-form
      v-col
        v-text-field(label="Title" :color="color" v-model="fields.title" :error-messages="errors.title" required)
        v-row(class="mx-auto")
          v-text-field(label="Time" hint="If AM or PM is not specified, this time will be interpreted as 24-hour." v-model="fields.time" :error-messages="errors.time" @change="validateTimeFormat" :color="color" class="w-45 " required)
          v-spacer
          v-text-field(label="Date" :color="color" readonly :value="fields.date" :error-messages="errors.date" append-icon="fa-calendar-alt" @click:append="visibility.datePicker = true" class="w-45" required)
          v-dialog(v-model="visibility.datePicker" max-width=500)
            v-date-picker(:color="color" v-model="fields.date" :min="today")
              v-icon(class="close-icon" color="white" @click="toggleDatePicker") fas fa-times
        v-textarea(label="Description (optional)" outlined no-resize rows="3" maxlength=2000 counter v-model="fields.description" :color="color" class="mb-0")
        v-col(align="center")
          v-btn(large :color="`${color} white--text`" class="mt-0 submit-button" @click="submit") {{ buttons.submit.text }}
            v-icon(class="mr-0" color="white" :class="{'ma-0': !buttons.submit.icon}") {{ buttons.submit.icon }}
</template>

<script>
export default {
  head: {
    link: [
      { rel: 'stylesheet', href: '/vendor/animatecss/animate.min.css' }
    ]
  },
  data () {
    return {
      // Data concerning showing or hiding elements
      visibility: {
        datePicker: false
      },
      // Data concerning the text/icons shown on buttons
      buttons: {
        submit: {
          text: 'Create',
          icon: null
        }
      },
      // Data concerning the value of fields
      fields: {
        title: null,
        time: null,
        date: null,
        description: null
      },
      // Data concerning whether the form has been submitted
      hasBeenSubmitted: false,
      // Data concerning the validity of fields
      validity: {
        time: true
      },
      // Data concerning formats of fields
      formats: {
        time: {
          isTwentyFourHour: null
        }
      },

      // Data concerning the appearance of the form
      color: 'indigo lighten-1'
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
      const splitTime = this.fields.time.split(' ')[0].split(':');
      // Parse hours and minutes
      const [hours, minutes] = [...splitTime.map(i => parseInt(i))];
      const dateObj = new Date(year, month - 1, date, hours, minutes);
      // Adjust time if 12 hour time format is being used
      if (!this.formats.time.isTwentyFourHour) {
        if (hours === 12 && this.fields.time.toLowerCase().includes('am')) {
          dateObj.setHours(hours - 12);
        }
        else if (hours !== 12 && this.fields.time.toLowerCase().includes('pm')) {
          dateObj.setHours(hours + 12);
        }
      }
      // Return the timestamp in Unix epoch time
      return dateObj.getTime() / 1000; /* This is divided by 1000 because JS displays Unix time in ms,
      whereas the backend expects to receive it in seconds */
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
      if (this.hasBeenSubmitted) {
        for (const i in errors) {
          if (!this.fields[i]) {
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
      this.hasBeenSubmitted = true;
      // Don't submit the form if there are errors
      for (const i in this.errors) {
        if (this.errors[i].length) {
          return;
        }
      }
      // Post with axios
      const URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/API/create-plan' : '/API/create-plan';
      await this.$axios({
        method: 'POST',
        url: URL,
        data: {
          title: this.fields.title,
          timestamp: this.timestamp,
          description: this.fields.description
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }
};
</script>

<style scoped>
.close-icon {
  position: absolute;
  right: 1rem;
  top: 1rem;
}
.w-45 {
  width: 45%;
}
</style>
