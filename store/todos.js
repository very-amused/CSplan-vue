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
  getLists ({ commit }) {
    if (localStorage.getItem('todos')) {
      const lists = JSON.parse(localStorage.getItem('todos'));
      lists.forEach(list => commit('addList', list));
    }
  },
  addList ({ commit, dispatch }, list) {
    commit('addList', list);
    dispatch('updateCache');
  },
  addItem ({ commit, dispatch }, { id, item }) {
    commit('addItem', { id, item });
    dispatch('updateCache');
  },
  toggleCompletion ({ commit, dispatch }, { id, itemIndex }) {
    commit('toggleItemCompletion', { id, itemIndex });
    dispatch('updateCache');
  },
  removeItem ({ commit, dispatch }, { id, itemIndex }) {
    commit('removeItem', { id, itemIndex });
    dispatch('updateCache');
  },
  updateCache ({ state }) {
    localStorage.setItem('todos', JSON.stringify(state));
  }
};
