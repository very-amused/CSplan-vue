import { genSymmetricKey, deepEncrypt, unwrapSymmetricKey, deepDecrypt } from '~/assets/crypto';

export const state = () => ([]);

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
  setItemCompletion (state, { id, itemIndex, completed }) {
    const index = state.findIndex(list => list.id === id);
    const item = state[index].items[itemIndex];
    state[index].items.splice(itemIndex, 1, { ...item, completed });
  },
  removeItem (state, { id, itemIndex }) {
    const index = state.findIndex(list => list.id === id);
    state[index].items.splice(itemIndex, 1);
  }
};

export const actions = {
  async reset ({ state }) {
    await this.$dexie.todos.clear();
    Object.assign(state, []);
  },

  async getLists ({ commit, state, rootState }) {
    const response = await this.$axios({
      method: 'GET',
      url: '/v1/todos/ids'
    });
    const data = response.data.data;
    const todos = await this.$dexie.todos.toArray();
    for (const identifier of data) {
      if (!todos.find(list => (list.id === identifier.id &&
        list.checksum === identifier.meta.checksum))) {
        const response = await this.$axios({
          method: 'GET',
          url: `/v1/todos/${identifier.id}`
        });
        const doc = response.data.data;

        if (!doc.meta.cryptoKey) {
          // Delete any todo list without a corresponding cryptokey
          await this.$axios({
            method: 'DELETE',
            url: `/v1/todos/${identifier.id}`
          });
          return;
        }
        const cryptoKey = await unwrapSymmetricKey(doc.meta.cryptoKey, rootState.user.keys.privateKey);

        const encryptedItems = doc.relationships.items.data.map(item => item.attributes);
        const { title, items } = await deepDecrypt({
          title: doc.attributes.title,
          items: encryptedItems
        }, cryptoKey);

        const mappedItems = items.map((item) => {
          return {
            ...item,
            completed: item.completed === 'true'
          };
        });

        const list = {
          id: doc.id,
          checksum: doc.meta.checksum,
          title,
          items: mappedItems,
          cryptoKey
        };

        await this.$dexie.todos.put(list);
      }
    };

    const updatedTodos = await this.$dexie.todos.toArray();
    for (const list of updatedTodos) {
      if (!state.find(l => l.id === list.id)) {
        commit('addList', list);
      }
    }
  },
  async addList ({ commit, dispatch, rootState }, list) {
    const { usable, exported } = await genSymmetricKey(rootState.user.keys.publicKey);
    const encrypted = await deepEncrypt(list, usable.symmetricKey);
    const mappedItems = encrypted.items.map((item) => {
      return {
        type: 'todo-item',
        attributes: {
          ...item
        }
      };
    });

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
              data: mappedItems
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
    list = { id, index, checksum, ...list, cryptoKey: usable.symmetricKey };
    // Add to Dexie
    await this.$dexie.todos.add(list);
    // Add to state
    commit('addList', list);
  },

  async removeList ({ commit }, id) {
    await this.$axios({
      method: 'DELETE',
      url: `/v1/todos/${id}`
    });

    await this.$dexie.todos.delete(id);
    await commit('removeList', id);
  },

  async addItem ({ state, commit, dispatch, rootState }, { id, item }) {
    // Get the list's symmetric key
    const index = state.findIndex(list => list.id === id);

    // Post the encrypted item to the API
    const encrypted = await deepEncrypt(item, state[index].cryptoKey);
    await this.$axios({
      method: 'POST',
      url: `/v1/todos/${id}/items`,
      data: {
        data: {
          type: 'todo-item',
          attributes: {
            ...encrypted
          }
        }
      }
    });

    // Update the local state
    const list = await this.$dexie.todos.get(id);
    list.items.push(item);
    await this.$dexie.todos.put(list);
    commit('addItem', { id, item });
  },
  async toggleCompletion ({ commit, state, rootState }, { id, itemIndex }) {
    const index = state.findIndex(list => list.id === id);
    const completed = !state[index].items[itemIndex].completed;
    const encryptedCompleted = await deepEncrypt(completed, state[index].cryptoKey);

    await this.$axios({
      method: 'PATCH',
      url: `/v1/todos/${id}/items/${itemIndex}`,
      data: {
        data: {
          type: 'todo-item',
          attributes: {
            completed: encryptedCompleted
          }
        }
      }
    });

    const list = await this.$dexie.todos.get(id);
    list.items[itemIndex].completed = completed;
    await this.$dexie.todos.put(list);

    commit('setItemCompletion', { id, itemIndex, completed });
  },
  async removeItem ({ commit, dispatch }, { id, itemIndex }) {
    await this.$axios({
      method: 'DELETE',
      url: `/v1/todos/${id}/items/${itemIndex}`
    });

    const list = await this.$dexie.todos.get(id);
    list.items.splice(itemIndex, 1);
    await this.$dexie.todos.put(list);

    commit('removeItem', { id, itemIndex });
  }
};
