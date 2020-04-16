import { importPublicKey, genSymmetricKey, importSymmetricKey, deepEncrypt } from '~/_middleware/crypto';
import { addItem } from '~/_middleware/handlers/todos';

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
  async getLists ({ commit }) {
    const todos = await this.$dexie.todos.toArray();
    todos.forEach((list) => {
      commit('addList', list);
    });
  },
  async addList ({ commit, dispatch, rootState }, list) {
    const publicKey = await importPublicKey(rootState.user.keys.publicKey);
    const { usable, exported } = await genSymmetricKey(publicKey);
    const encrypted = await deepEncrypt(list, usable.symmetricKey);
    const { data } = await this.$axios({
      method: 'POST',
      url: '/v1/todos',
      data: {
        data: {
          type: 'todo-list',
          attributes: {
            title: encrypted.title
          },
          relationships: {
            items: {
              data: encrypted.items.map((item) => {
                return {
                  type: 'todo-item',
                  attributes: {
                    ...item
                  }
                };
              })
            }
          },
          meta: {
            cryptoKey: exported.encryptedSymmetricKey
          }
        }
      }
    });
    const id = data.data.id;
    const index = data.data.meta.index;
    const checksum = data.data.meta.checksum;
    // Update the list with its generated info, and symmetric key
    list = { ...list, id, index, checksum, cryptoKey: usable.symmetricKey };
    // Add to Dexie
    await this.$dexie.todos.add(list);
    // Add to state
    commit('addList', list);
  },
  async addItem ({ state, commit, dispatch, rootState }, { id, item }) {
    // Get the list's symmetric key
    const index = state.findIndex(list => list.id === id);
    const symmetricKey = await importSymmetricKey(state[index].cryptoKey);

    // Post the encrypted item to the API
    const encrypted = await deepEncrypt([ item ], symmetricKey);
    await addItem(this.$axios, id, encrypted);

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
  }
};
