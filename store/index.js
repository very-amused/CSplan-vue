export const state = () => ({
  color: localStorage.getItem('accent-color') || '#3D5AFE'
});

export const mutations = {
  update (state, color) {
    state.color = color;
  }
};
