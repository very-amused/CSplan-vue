import VueCookie from 'vue-cookie';

export default ({ app }, inject) => {
  inject('cookie', VueCookie);
};
