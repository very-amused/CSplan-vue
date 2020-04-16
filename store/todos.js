import { importPublicKey, importPrivateKey, genSymmetricKey, deepEncrypt, unwrapSymmetricKey, deepDecrypt } from '~/_middleware/crypto';

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
  async getLists ({ commit, rootState }) {
    const response = await this.$axios({
      method: 'GET',
      url: '/v1/todos/ids'
    });
    const data = response.data.data;
    let todos = await this.$dexie.todos.toArray();
    const privateKey = await importPrivateKey(rootState.user.keys.privateKey);
    data.forEach(async (identifier) => {
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
        const cryptoKey = await unwrapSymmetricKey(doc.meta.cryptoKey, privateKey);

        const encryptedItems = doc.relationships.items.data.map((item) => {
          return {
            ...item.attributes,
            completed: item.attributes.completed === 'true'
          };
        });
        const { title, items } = await deepDecrypt({
          title: doc.attributes.title,
          items: encryptedItems
        }, cryptoKey);

        const list = {
          id: doc.id,
          checksum: doc.meta.checksum,
          title,
          items,
          cryptoKey
        };

        await this.$dexie.todos.put(list);
        todos = await this.$dexie.todos.toArray();
      }
    });

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
    list = { id, index, checksum, ...list, cryptoKey: usable.symmetricKey };
    // Add to Dexie
    await this.$dexie.todos.add(list);
    // Add to state
    commit('addList', list);
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
  async toggleCompletion ({ commit, state, dispatch }, { id, itemIndex }) {
    const index = state.findIndex(list => list.id === id);
    const completed = !state[index].items[itemIndex].completed;
    const list = await this.$dexie.todos.get(id);
    list.items[itemIndex].completed = completed;
    await this.$dexie.todos.put(list);

    commit('setItemCompletion', { id, itemIndex, completed });
  },
  removeItem ({ commit, dispatch }, { id, itemIndex }) {
    commit('removeItem', { id, itemIndex });
  }
};
