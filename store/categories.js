import { genSymmetricKey, deepEncrypt } from '~/assets/crypto';

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
  }
};

export const actions = {
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
      url: '/v1/categories',
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
      id
    });
    this.$dexie.categories.add({
      ...body,
      id,
      checksum
    });
  },
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
  },
  async removeCategory ({ commit, state }, index) {
    const id = state[index].id;
    commit('removeCategory', index);

    await this.$dexie.categories.delete(id);
    await this.$axios({
      method: 'DELETE',
      url: `/v1/categories/${id}`
    });
  }
};
