<template lang="pug">
div(class="main" @mousewheel.prevent="onScroll($event)" :style="`--navbar-height: ${navbarHeight}px`")
  div(class="splash" :class="{blurred: showOutline}")
  section(v-if="!showOutline" class="hero is-dark")
    div(class="hero-body")
      div(class="container")
        header(class="title is-size-1") CSplan
        h2(class="subtitle") Take back your time.

  section(v-if="!showOutline" class="startbutton")
    b-button(@click="showOutline = true" rounded type="is-info" size="is-medium") Why CSplan?
    b-button(rounded type="is-primary" size="is-medium" tag="nuxt-link" to="/account/register") Create an Account
  div(v-else class="slides" :class="{show: showOutline}")
    div(class="card")
      div(class="card-header")
        header(class="title card-header-title") {{ slides[activeSlide].title }}
      div(class="card-content")
        div(v-html="marked(slides[activeSlide].description)" class="content")
    b-button(type="is-primary" class="action-prompt" tag="nuxt-link" to="/account/register") Create an Account

  footer(class="footer" v-if="showOutline")
    b-button(@click="showOutline = false" icon-left="arrow-left" type="is-text")
    section(class="slide-indicator")
      b-button(v-for="(slide, index) in slides" :key="index" @click="activeSlide = index" class="invisible-button" size="is-small")
        b-icon(icon="circle" :type="index === activeSlide ? 'is-primary' : 'is-text'" size="is-small")
</template>

<script>
import marked from 'marked';
export default {
  data () {
    return {
      splashImage: '',
      showOutline: false,
      activeSlide: 0,
      navbarHeight: 0,
      slides: []
    };
  },

  async mounted () {
    // Responsively account for layout elements in calculating exact height
    this.navbarHeight = document.querySelector('.navbar').getBoundingClientRect().height;

    document.querySelector('.splash').style.backgroundImage = `url("https://images.unsplash.com/photo-1571607073129-606b83b78f02?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=${window.outerWidth}&fit=crop&crop=entropy")`;

    // Init slides from JSON file
    const res = await fetch('/content/slides.json');
    this.slides = await res.json();
  },

  beforeDestroy () {
    document.querySelector('html').style.backgroundImage = '';
    window.removeEventListener('resize', this.setHeight);
  },

  methods: {
    marked (text) {
      return marked(text);
    },
    blur () {
      this.splashBlur = 5;
    },
    onScroll (evt) {
      if (!this.showOutline) {
        return;
      }

      const forwards = evt.deltaY > 0;
      if (forwards && this.activeSlide < this.slides.length - 1) {
        this.activeSlide++;
      }
      else if (!forwards && this.activeSlide > 0) {
        this.activeSlide--;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import '~/assets/css/invisible-button.css';
.main {
  position: absolute;
  width: 100%;
  height: calc(100% - var(--navbar-height))
}
.splash {
  height: 100%;
  transition: filter 0.5s;
  &.blurred {
    filter: blur(5px)
  }
}
.hero {
  position: absolute;
  top: 0;
  width: 100%;
}
.startbutton {
  position: absolute;
  top: 50%;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  * {
    margin: 0 1rem;
  }
}
.action-prompt {
  position: absolute;
  bottom: 10rem;
}
.slides {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  > div {
    background-color: rgba(245, 245, 245, 0.8);
    border-radius: 0.25rem;
    max-width: 30rem;
  }
  /* Fade transition */
  opacity: 1;
  transition: opacity 2s;
}
.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 1rem;
  background: transparent;
  color: whitesmoke;
}
</style>
