export const state = () => ({
  token: '',
  displayName: ''
});

export const mutations = {
  setToken (state, token) {
    state.token = token;
  },
  setDisplayName (state, displayName) {
    state.displayName = displayName;
  }
};
