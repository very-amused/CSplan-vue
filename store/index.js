export const state = () => ({
  token: '',
  user: '',
  color: 'blue'
});

export const mutations = {
  setToken (state, token) {
    state.token = token;
  },
  setUser (state, user) {
    state.user = { ...user };
  }
};
