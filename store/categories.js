export const state = () => ([
  {
    id: '1234',
    title: 'Sample Category',
    color: {
      hex: '#AA00FF'
    }
  }
]);

export const mutations = {
  addCategory (state, body) {
    state.push(body);
  },
  removeCategory (state, index) {
    state.splice(index, 1);
  },
  updateTitle (state, { index, title }) {
    state[index].title = title;
  }
};

export const actions = {
  updateTitle ({ commit }, { index, title }) {
    commit('updateTitle', { index, title });
  }
};
