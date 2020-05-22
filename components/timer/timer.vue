<template lang="pug">
section
  b-field(class="custom")
    timer-button(v-show="!running" @click="time += 60 * 60" icon="plus")
    p(class="is-family-monospace") {{ hours.string }}
    timer-button(v-show="!running" @click="time -= 60 * 60" icon="minus")

  div(class="separator")

  b-field(class="custom")
    timer-button(v-show="!running" @click="time += 60" icon="plus")
    p(class="is-family-monospace") {{ minutes.string }}
    timer-button(v-show="!running" @click="time -= 60" icon="minus")

  div(class="separator")

  b-field(class="custom")
    timer-button(v-show="!running" @click="time++" icon="plus")
    p(class="is-family-monospace") {{ seconds.string }}
    timer-button(v-show="!running" @click="time--" icon="minus")

  b-field(class="custom")
    b-button(@click="running ? stop() : start()" size="is-large" class="mb")
      b-icon(icon="timer" :type="running ? 'is-success' : 'is-text'" size="is-large")
    b-button(@click="stop(); time = 0" size="is-large" class="mb")
      b-icon(icon="close" size="is-large")

  audio(id="notification")
    source(src="/audio/bruh.mp3" type="audio/mpeg")
</template>

<script>
import timerButton from './timerButton';
export default {
  components: {
    timerButton
  },

  data () {
    return {
      time: 0,
      tickInterval: null,
      running: false
    };
  },

  computed: {
    // Values for hours, minutes, and seconds are computed as the time changes.
    // This is a 100% reliable method of displaying these values
    hours () {
      const hours = Math.floor(this.time / (60 * 60));
      return {
        num: hours,
        string: hours.toString().padStart(2, '0')
      };
    },
    minutes () {
      const minutes = Math.floor((this.time - (60 * 60 * this.hours.num)) / 60);
      return {
        num: minutes,
        string: minutes.toString().padStart(2, '0')
      };
    },
    seconds () {
      const seconds = (this.time - (60 * 60 * this.hours.num) - (60 * this.minutes.num));
      return {
        num: seconds,
        string: seconds.toString().padStart(2, '0')
      };
    },
    // Used for the window's title while the timer is running
    formattedTime () {
      return `${this.hours.num ? `${this.hours.num}:` : ''}${this.minutes.string}:${this.seconds.string}`;
    }
  },

  watch: {
    // Prevent negative times from being set
    time (val) {
      if (val < 0) {
        this.time = 0;
      }
    }
  },

  methods: {
    async start () {
      // Ask the user for notification permission if it hasn't already been granted
      await Notification.requestPermission();
      if (!this.time) {
        this.stop();
        this.alert();
        return;
      }
      this.running = true;
      this.tickInterval = setInterval(this.tick, 1000);
    },
    tick () {
      this.time--;
      if (!this.time) {
        this.stop();
        this.alert();
        return;
      }
      document.title = `CSplan - ${this.formattedTime}`;
    },
    stop () {
      this.running = false;
      document.title = 'CSplan';
      clearInterval(this.tickInterval);
    },
    alert () {
      const audio = document.querySelector('#notification');
      audio.play();
      if (Notification.permission === 'granted') {
        const notification = new Notification('Your timer is done!!!');
        notification.onclose = () => {
          // Pause + reload to set audio position back to the beginning
          audio.pause();
          audio.load();
        };
      }
      else {
        alert('Your timer is done!!!');
      }
    }
  }
};
</script>

<style scoped>
section {
  display: flex;
  height: 80vh;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
}
.field.custom {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 1.5rem;
}
.mb {
  margin-bottom: 1rem;
}
.mt {
  margin-top: 1rem;
}
.separator::before {
  content: ":";
}
.separator {
  padding-bottom: 1.5rem;
}
</style>
