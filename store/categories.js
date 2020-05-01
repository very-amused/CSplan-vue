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
  },
  updateColor (state, { index, color }) {
    state[index].color.hex = color.hex;
  }
};

export const actions = {
  async updateTitle ({ commit, state }, { index, title }) {
    commit('updateTitle', { index, title });
    await this.$dexie.categories.put(state[index]);
  },
  async updateColor ({ commit, state }, { index, color }) {
    commit('updateColor', { index, color });
    const id = state[index].id;
    await this.$dexie.categories.update(id, {
      color: {
        hex: color.hex
      }
    });
  }
};
