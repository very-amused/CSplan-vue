import { importPublicKey, genSymmetricKey, importSymmetricKey, deepEncrypt } from '~/_middleware/crypto';
import { addList, addItems } from '~/_middleware/handlers/todos';

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
    state[index].items.splice(itemIndex, 1, { ...item, completed: !item.completed });
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
  async addList ({ commit, dispatch, rootState }, { axios, list }) {
    const publicKey = await importPublicKey(rootState.user.keys.publicKey);
    const { usable, exported } = await genSymmetricKey(publicKey);
    const encrypted = await deepEncrypt(list, usable.symmetricKey);
    const id = await addList(axios, {
      ...encrypted,
      cryptoKey: exported.encryptedSymmetricKey
    });
    // Update the list with its generated id and symmetric key
    list = { ...list, id, cryptoKey: exported.symmetricKey };
    dispatch('updateCache', list);
    commit('addList', list);
  },
  async addItem ({ state, commit, dispatch, rootState }, { axios, id, item }) {
    // Get the list's symmetric key
    const index = state.findIndex(list => list.id === id);
    const symmetricKey = await importSymmetricKey(state[index].cryptoKey);

    // Post the encrypted item to the API
    const encrypted = await deepEncrypt([ item ], symmetricKey);
    await addItems(axios, id, encrypted);

    // Update the local state
    dispatch('updateCache');
    commit('addItem', { id, item });
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
