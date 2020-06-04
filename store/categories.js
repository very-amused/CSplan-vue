import { genSymmetricKey, deepEncrypt, encrypt, unwrapSymmetricKey, deepDecrypt } from '~/assets/crypto';

export const state = () => ([]);

export const mutations = {
  addCategory (state, body) {
    state.splice(0, 0, body);
  },
  removeCategory (state, index) {
    state.splice(index, 1);
  },
  updateTitle (state, { index, title }) {
    state[index].title = title;
  },
  updateColor (state, { index, color }) {
    state[index].color.hex = color.hex;
  },
  reset (state) {
    state.splice(0, state.length);
  }
};

export const actions = {
  async getCategories ({ commit, state, rootState }) {
    const response = await this.$axios({
      method: 'GET',
      url: '/v0/categories/ids'
    });
    const data = response.data.data;
    const categories = await this.$dexie.categories.toArray();

    for (const identifier of data) {
      if (!categories.find(category => category.id === identifier.id &&
      category.checksum === identifier.meta.checksum)) {
        const response = await this.$axios({
          method: 'GET',
          url: `/v0/categories/${identifier.id}`
        });
        const doc = response.data.data;

        if (!doc.meta.cryptoKey) {
          await this.$axios({
            method: 'DELETE',
            url: `/v0/categories/${identifier.id}`
          });
          return;
        }
        const cryptoKey = await unwrapSymmetricKey(doc.meta.cryptoKey, rootState.user.keys.privateKey);

        const { title, color } = await deepDecrypt(doc.attributes, cryptoKey);
        await this.$dexie.categories.put({
          id: doc.id,
          title,
          color,
          checksum: doc.meta.checksum,
          cryptoKey
        });
      }
    }

    const updatedCategories = await this.$dexie.categories.toArray();
    updatedCategories.forEach((cat) => {
      if (!state.find(val => val.id === cat.id)) {
        commit('addCategory', cat);
      }
    });
  },

  async reset ({ commit }) {
    await this.$dexie.categories.clear();
    commit('reset');
  },

  async createCategory ({ commit, rootState }) {
    const { usable, exported } = await genSymmetricKey(rootState.user.keys.publicKey);

    const body = {
      title: 'New Category',
      color: {
        hex: '#FFFFFF'
      }
    };
    const encrypted = await deepEncrypt(body, usable.symmetricKey);
    const response = await this.$axios({
      method: 'POST',
      url: '/v0/categories',
      data: {
        data: {
          type: 'category',
          attributes: encrypted,
          meta: {
            cryptoKey: exported.encryptedSymmetricKey
          }
        }
      }
    });

    const id = response.data.data.id;
    const checksum = response.data.data.meta.checksum;
    commit('addCategory', {
      ...body,
      id,
      cryptoKey: usable.symmetricKey
    });
    this.$dexie.categories.add({
      id,
      ...body,
      checksum,
      cryptoKey: usable.symmetricKey
    });
  },
  async updateTitle ({ commit, state }, { index, title }) {
    commit('updateTitle', { index, title });
    await this.$dexie.categories.update(state[index].id, { title });

    const encrypted = await encrypt(title, state[index].cryptoKey);
    await this.$axios({
      method: 'PATCH',
      url: `/v0/categories/${state[index].id}`,
      data: {
        data: {
          type: 'category',
          attributes: {
            title: encrypted
          }
        }
      }
    });
  },
  async updateColor ({ commit, state }, { index, color }) {
    commit('updateColor', { index, color });
    const id = state[index].id;
    await this.$dexie.categories.update(id, {
      color: {
        hex: color.hex
      }
    });
  },
  async submitColor ({ state }, index) {
    const id = state[index].id;
    const encrypted = await encrypt(state[index].color.hex, state[index].cryptoKey);
    await this.$axios({
      method: 'PATCH',
      url: `/v0/categories/${id}`,
      data: {
        data: {
          type: 'category',
          attributes: {
            color: {
              hex: encrypted
            }
          }
        }
      }
    });
  },
  async removeCategory ({ commit, state }, index) {
    const id = state[index].id;
    commit('removeCategory', index);

    await this.$dexie.categories.delete(id);
    await this.$axios({
      method: 'DELETE',
      url: `/v0/categories/${id}`
    });
  }
};
