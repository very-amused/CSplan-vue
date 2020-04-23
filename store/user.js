import { importPublicKey, publicEncrypt, importPrivateKey, privateDecrypt, generateMasterKeypair, genSymmetricKey, deepEncrypt, importSymmetricKey, unwrapSymmetricKey, deepDecrypt } from '~/assets/crypto'; // eslint-disable-line
import { AxiosStatic } from 'axios'; // eslint-disable-line

/**
 * @typedef {Object} Keys
 * @property {string} publicKey - Base64 encoded RSA public key
 * @property {string} privateKey - Base64 encoded RSA private key
 */

const initialState = () => ({
  isLoggedIn: false,
  id: '',
  keys: {
    publicKey: null,
    privateKey: null
  },
  name: {
    firstName: '',
    lastName: '',
    username: ''
  }
});

export const state = () => ({
  isLoggedIn: false,
  id: '',
  keys: {
    publicKey: null,
    privateKey: null
  },
  name: {
    firstName: '',
    lastName: '',
    username: ''
  }
});

export const getters = {
  displayName (state) {
    if (!state.isLoggedIn) {
      return '';
    }

    return state.name.username || `${state.name.firstName || ''} ${state.name.lastName || ''}`.trim();
  }
};

export const mutations = {
  /**
   *
   * @param state - VueX State
   * @param {object} keyval - Single key-value pair
   */
  setLoggedIn (state, value) {
    state.isLoggedIn = value;
  },
  setID (state, id) {
    state.id = id;
  },
  setKeys (state, keys) {
    state.keys = { ...keys };
  },
  setName (state, name) {
    state.name = { ...name };
  }
};

export const actions = {
  async init ({ commit, dispatch }) {
    const user = await this.$dexie.user.toCollection().first();
    if (user) {
      commit('setLoggedIn', true);
      commit('setID', user.id);
      await dispatch('updateLoggedInState'); // Verify the user's authentication token
      commit('setKeys', user.keys);
      await dispatch('updateName');
    }
  },

  async register ({ commit, dispatch }, body) {
    const response = await this.$axios({
      method: 'POST',
      url: '/v1/register',
      data: {
        data: {
          type: 'user',
          attributes: {
            ...body
          }
        }
      }
    });
    const id = response.data.data.id;
    await this.$dexie.user.put({ id });
    await commit('setID', id);
  },

  /**
   * Log in the user
   * @param {AxiosStatic} axios
   */
  async login ({ commit, state }, body) {
    const response = await this.$axios({
      method: 'POST',
      url: '/v1/login',
      data: {
        data: {
          type: 'user',
          attributes: {
            ...body
          }
        }
      }
    });
    const token = response.data.data.id;

    await commit('setLoggedIn', true);
    // Store the token in the cookies (expires after a week)
    if (this.$cookie.get('Authorization')) {
      this.$cookie.delete('Authorization');
    }
    this.$cookie.set('Authorization', token, { expires: 7 });
  },

  /**
   * Log out the user
   */
  async logout ({ dispatch }) {
    await this.$axios({
      method: 'POST',
      url: '/v1/account/logout'
    });

    dispatch('reset');
    // Reset each namespaced module
    const modules = [
      'todos'
    ];
    for (const module of modules) {
      await dispatch(`${module}/reset`, null, { root: true });
    }
  },

  async genKeypair ({ commit, state }, body) {
    const keyInfo = await generateMasterKeypair(body.password);
    // Store the generated keypair in the API
    await this.$axios({
      method: 'POST',
      url: '/v1/account/keys',
      data: {
        data: {
          type: 'key-data',
          attributes: {
            publicKey: keyInfo.keys.exported.publicKey,
            privateKey: keyInfo.keys.exported.encryptedPrivateKey,
            PBKDF2salt: keyInfo.PBKDF2salt
          }
        }
      }
    });

    // Update the localstate with usable CryptoKey objects
    await this.$dexie.user.update(state.id, {
      keys: {
        ...keyInfo.keys.usable
      }
    });
    await commit('setKeys', {
      ...keyInfo.keys.usable
    });
  },

  async reset ({ replaceState }) {
    await this.$dexie.user.clear();
    this.replaceState(initialState);
  },

  /**
   * Get whether or not the user is logged in
   */
  async getLoggedInState ({ commit }) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || false;
    await commit('setLoggedIn', isLoggedIn);
  },

  /**
   * Encrypt and set the user's name
   */
  async setName ({ commit, state }, body) {
    // Encrypt each field that isn't empty
    const key = await genSymmetricKey(state.keys.publicKey);
    const encrypted = await deepEncrypt(body, key.usable.symmetricKey);

    const response = await this.$axios({
      method: 'PATCH',
      url: '/v1/account/name',
      data: {
        data: {
          type: 'user-name',
          attributes: {
            ...encrypted
          },
          meta: {
            cryptoKey: key.exported.encryptedSymmetricKey
          }
        }
      }
    });

    await commit('setName', body);
    body.checksum = response.data.data.meta.checksum;
    await this.$dexie.user.update(state.id, {
      name: body
    });
  },

  async updateName ({ commit, state }) {
    const response = await this.$axios({
      method: 'GET',
      url: '/v1/account/name'
    });
    const checksum = response.data.data.meta.checksum;
    const user = await this.$dexie.user.get(state.id);

    if (checksum !== user.name.checksum) {
      const encrypted = response.data.data.attributes;
      const encodedKey = response.data.data.meta.cryptoKey;
      const key = await unwrapSymmetricKey(encodedKey, state.keys.privateKey);
      const body = {
        ...await deepDecrypt(encrypted, key),
        checksum
      };

      await this.$dexie.user.update(state.id, {
        name: body
      });
    }
    await commit('setName', { ...await this.$dexie.user.get(state.id) }.name);
  },

  async updateLoggedInState ({ dispatch, state }) {
    if (state.isLoggedIn) {
      try {
        await this.$axios({
          method: 'GET',
          url: '/v1/account/whoami'
        });
      }
      catch {
        await dispatch('reset');
      }
    }
  }
};
