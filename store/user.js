import { generateMasterKeypair, genSymmetricKey, deepEncrypt, importSymmetricKey, unwrapSymmetricKey, deepDecrypt, unwrapMasterKeypair } from '~/assets/crypto'; // eslint-disable-line

/**
 * @typedef {Object} Keys
 * @property {string} publicKey - Base64 encoded RSA public key
 * @property {string} privateKey - Base64 encoded RSA private key
 */

const initialState = () => {
  return {
    isLoggedIn: false,
    id: '',
    keys: {
      publicKey: null,
      privateKey: null
    },
    email: '',
    name: {
      firstName: '',
      lastName: '',
      username: ''
    }
  };
};

export const state = initialState;

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
  setEmail (state, email) {
    state.email = email;
  },
  setKeys (state, keys) {
    state.keys = { ...keys };
  },
  setName (state, name) {
    state.name = { ...name };
  },
  reset (state) {
    Object.assign(state, initialState());
  }
};

export const actions = {
  async init ({ commit, dispatch }) {
    const user = await this.$dexie.user.toCollection().first();
    if (user) {
      this.$axios.defaults.headers.common['CSRF-TOKEN'] = user.CSRFtoken;
      commit('setLoggedIn', true);
      commit('setID', user.id);
      commit('setEmail', user.email);
      await dispatch('updateLoggedInState'); // Verify the user's authentication token
      commit('setKeys', user.keys);
      await dispatch('updateName');
    }
    dispatch('settings/init', null, { root: true });
  },

  async register ({ commit, dispatch }, body) {
    const response = await this.$axios({
      method: 'POST',
      url: '/v0/register',
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
    commit('setEmail', body.email);
  },

  /**
   * Log in the user
   * @param {AxiosStatic} axios
   */
  async login ({ commit, state }, body) {
    const { data } = await this.$axios({
      method: 'POST',
      url: '/v0/login',
      data: {
        data: {
          type: 'user',
          attributes: {
            ...body
          }
        }
      },
      withCredentials: true
    });

    const id = data.data.relationships.user.data.id;
    const keydata = data.data.relationships.keys.data.attributes;
    await this.$dexie.user.put({ id, email: body.email });
    await this.$dexie.settings.put({ id });
    let keys = {};
    if (Object.keys(keydata).length) {
      keys = await unwrapMasterKeypair(body.password, keydata);
    }
    await this.$dexie.user.update(id, {
      keys,
      CSRFtoken: data.data.attributes.CSRFtoken
    });
    // Set CSRF token
    this.$axios.defaults.headers.common['CSRF-TOKEN'] = data.data.attributes.CSRFtoken;
    commit('setKeys', keys.usable);
    commit('setID', id);
    commit('setEmail', body.email);
    await commit('setLoggedIn', true);
  },

  /**
   * Log out the user
   */
  async logout ({ dispatch }) {
    await this.$axios({
      method: 'POST',
      url: '/v0/account/logout'
    });

    await dispatch('reset');
    // Reset each namespaced module
    const modules = [
      'todos',
      'categories'
    ];
    for (const module of modules) {
      await dispatch(`${module}/reset`, null, { root: true });
    }
  },

  async reset ({ commit }) {
    await this.$dexie.user.clear();
    commit('reset');
  },

  async genKeypair ({ commit, state }, body) {
    const keyInfo = await generateMasterKeypair(body.password);
    // Store the generated keypair in the API
    await this.$axios({
      method: 'POST',
      url: '/v0/account/keys',
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
      url: '/v0/account/name',
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
      url: '/v0/account/name'
    });
    const checksum = response.data.data.meta.checksum;
    const user = await this.$dexie.user.get(state.id);

    if (checksum !== user.name?.checksum) {
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
          url: '/v0/account/whoami'
        });
      }
      catch {
        await dispatch('reset');
        location.reload();
      }
    }
  }
};
