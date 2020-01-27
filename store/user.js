export const state = () => ({
  token: '',
  info: ''
});

export const mutations = {
  setToken (state, token) {
    state.token = token;
  },
  setInfo (state, info) {
    state.info = info;
  }
};
