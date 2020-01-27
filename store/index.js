export const state = () => ({
  color: 'blue'
});

export const mutations = {
  init (state) {
    if (localStorage.getItem('store')) {
      this.replaceState(
        Object.assign(state, JSON.parse(localStorage.getItem('store')))
      );
    }
  }
};
