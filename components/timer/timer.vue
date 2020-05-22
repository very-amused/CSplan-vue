<template lang="pug">
div(class="main")
  b-field
    b-input(v-model="title" size="is-large")

  section(class="horizontal" :style="`font-size: ${size}rem`")
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

    audio(id="notification" loop)
      source(:src="`/audio/${sound.mp3}`" type="audio/mpeg")
</template>

<script>
import timerButton from './timerButton';
export default {
  components: {
    timerButton
  },

  props: {
    size: {
      type: Number,
      default () {
        return 5;
      }
    },
    sound: {
      type: Object,
      default () {
        return {
          name: 'Microwave',
          mp3: 'microwave.mp3'
        };
      }
    }
  },

  data () {
    return {
      title: 'Timer',
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
      // Play audio alert
      const audio = document.querySelector('#notification');
      audio.load();
      audio.play();

      // Show the user a notification
      if (Notification.permission === 'granted') {
        const notification = new Notification(this.title);
        notification.onclose = () => {
          audio.pause();
        };
      }
      else {
        alert(this.title);
        audio.pause();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
header {
  text-align: center;
}
div.main {
  margin-top: 1.5rem;
}
section.horizontal {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  @media screen and (max-width: 1200px) {
    font-size: 2rem !important;
  }
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
