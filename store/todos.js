export const state = () => ([
  {
    id: '1234',
    title: 'Sample List',
    items: []
  }
]);

export const mutations = {
  addList (state, body) {
    state.push(body);
  },
  removeList (state, id) {
    const index = state.findIndex(list => list.id === id);
    state.splice(index, 1);
  },
  addItem (state, { id, item }) {
    const index = state.findIndex(list => list.id === id);
    state[index].items.push(item);
  },
  toggleItemCompletion (state, { id, itemIndex }) {
    const index = state.findIndex(list => list.id === id);
    const item = state[index].items[itemIndex];
    item.completed = !item.completed;
  },
  removeItem (state, { id, itemIndex }) {
    const index = state.findIndex(list => list.id === id);
    state[index].items.splice(itemIndex, 1);
  }
};

export const actions = {
  addItem ({ commit }, { id, item }) {
    commit('addItem', { id, item });
  },
  toggleCompletion ({ commit }, { id, itemIndex }) {
    commit('toggleItemCompletion', { id, itemIndex });
  },
  removeItem ({ commit }, { id, itemIndex }) {
    commit('removeItem', { id, itemIndex });
  }
};
