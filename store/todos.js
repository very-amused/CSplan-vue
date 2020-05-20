import { DialogProgrammatic as Dialog } from 'buefy';
import { genSymmetricKey, deepEncrypt, unwrapSymmetricKey, deepDecrypt, encrypt } from '~/assets/crypto';

export const state = () => ([]);

export const mutations = {
  addList (state, body) {
    state.push(body);
  },
  removeList (state, id) {
    const index = state.findIndex(list => list.id === id);
    state.splice(index, 1);
  },
  setTitle (state, { index, title }) {
    state[index].title = title;
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
  setCategory (state, { index, itemIndex, category }) {
    state[index].items[itemIndex].category = category;
  },
  toggleEditable (state, { index, itemIndex }) {
    const item = state[index].items[itemIndex];
    state[index].items.splice(itemIndex, 1, { ...item, editable: !item.editable });
  },
  updateItem (state, { index, itemIndex, item }) {
    const old = state[index].items[itemIndex];
    state[index].items.splice(itemIndex, 1, { ...old, ...item });
  },
  removeItem (state, { id, itemIndex }) {
    const index = state.findIndex(list => list.id === id);
    state[index].items.splice(itemIndex, 1);
  },
  reset (state) {
    state.splice(0, state.length);
  }
};

export const actions = {
  async reset ({ commit }) {
    await this.$dexie.todos.clear();
    commit('reset');
  },

  async getLists ({ commit, state, rootState }) {
    const response = await this.$axios({
      method: 'GET',
      url: '/v1/todos'
    });
    const data = response.data.data;
    const todos = await this.$dexie.todos.toArray();
    for (const todo of data) {
      if (!todos.find(list => (list.id === todo.id &&
        list.checksum === todo.meta.checksum))) {
        if (!todo.meta.cryptoKey) {
          // Delete any todo list without a corresponding cryptokey
          await this.$axios({
            method: 'DELETE',
            url: `/v1/todos/${todo.id}`
          });
          return;
        }
        const cryptoKey = await unwrapSymmetricKey(todo.meta.cryptoKey, rootState.user.keys.privateKey);

        const encryptedItems = todo.relationships.items.data.map(item => item.attributes);
        const { title, items } = await deepDecrypt({
          title: todo.attributes.title,
          items: encryptedItems
        }, cryptoKey);

        const mappedItems = items.map((item) => {
          return {
            ...item,
            completed: item.completed === 'true'
          };
        });

        const list = {
          id: todo.id,
          checksum: todo.meta.checksum,
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

  async addList ({ commit, dispatch, rootState }) {
    let list = {
      title: 'Untitled',
      items: []
    };

    const { usable, exported } = await genSymmetricKey(rootState.user.keys.publicKey);
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
              data: []
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

  async setTitle ({ commit, state }, { id, title }) {
    const index = state.findIndex(list => list.id === id);
    if (!title) {
      commit('setTitle', { index, title: 'Untitled' });
      return;
    }
    commit('setTitle', { index, title });

    try {
      const response = await this.$axios({
        method: 'PATCH',
        url: `/v1/todos/${id}`,
        data: {
          data: {
            type: 'todo-list',
            attributes: {
              title: await encrypt(title, state[index].cryptoKey)
            }
          }
        }
      });
      await this.$dexie.todos.update(id, { title, checksum: response.data.data.meta.checksum });
    }
    catch {
      Dialog.alert({
        title: 'Error',
        message: 'An error has occured while trying to update this todo list\'s title.',
        type: 'is-danger'
      });
    }
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
    commit('addItem', { id, item: { ...item, editable: false } });
  },

  async updateItem ({ commit, state }, { index, itemIndex, item }) {
    item.title = item.title.length ? item.title : 'Untitled';
    commit('updateItem', { index, itemIndex, item });

    const encrypted = await deepEncrypt(item, state[index].cryptoKey);
    const id = state[index].id;

    const list = await this.$dexie.todos.get(id);
    list.items[itemIndex] = { ...list.items[itemIndex], ...item };
    await this.$dexie.todos.update(id, { items: list.items });

    await this.$axios({
      method: 'PATCH',
      url: `/v1/todos/${state[index].id}/items/${itemIndex}`,
      data: {
        data: {
          type: 'todo-item',
          attributes: {
            ...encrypted
          }
        }
      }
    });
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
