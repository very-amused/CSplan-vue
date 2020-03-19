import { importPrivateKey, privateDecrypt } from '~/_middleware/crypto'; // eslint-disable-line
import { getName, NameBody } from '~/_middleware/handlers/name'; // eslint-disable-line
import { login } from '~/_middleware/handlers/auth';
import { AxiosStatic } from 'axios'; // eslint-disable-line

/**
 * @typedef {Object} Keys
 * @property {string} publicKey - Base64 encoded RSA public key
 * @property {string} privateKey - Base64 encoded RSA private key
 */

/**
 * Typedef for user state
 * @typedef {Object} UserState
 * @property {boolean} isLoggedIn - Bool indicating whether the user is logged in
 * (persisted in localStorage)
 * @property {Keys} keys - The user's private and public RSA keys
 * (for usage in clientside crypto operations)
 * @property {string} displayName - The user's display name
 * (username or first + last given name)
 */

/**
 * @exports UserState
 */
export const state = () => ({
  isLoggedIn: false,
  keys: {
    publicKey: null,
    privateKey: null
  },
  displayName: ''
});

export const mutations = {
  /**
   *
   * @param state - VueX State
   * @param {object} keyval - Single key-value pair
   */
  set (state, keyval) {
    return new Promise((resolve, reject) => {
      const key = Object.keys({ ...keyval })[0];
      const val = keyval[key];
      state[key] = val;
      return resolve();
    });
  },
  /**
   * Alert components that the user is logged in
   * @param {UserState} state
   */
  login (state) {
    localStorage.setItem('isLoggedIn', true);
    state.isLoggedIn = true;
  },
  /**
   * Alert components that the user is no longer logged in
   * @param {UserState} state
   */
  logout (state) {
    localStorage.setItem('isLoggedIn', false);
    state.isLoggedIn = false;
  },
  /**
   * Set the user's display name
   * @param {UserState} state
   * @param {NameBody} nb - Name Body
   */
  setName (state, nb) {
    state.displayName = nb.username || `${nb.firstName || ''}${nb.lastName ? ' ' + nb.lastName : ''}`;
  }
};

export const actions = {
  /**
   * Initialize the store on page load
   * @param {*} param0
   * @param {AxiosStatic} axios
   */
  async init ({ dispatch, state }, axios) {
    // Check whether or not the user is logged in or not
    await dispatch('getLoggedInState');

    // If the user is logged in, fetch relevant info about them from the API
    if (state.isLoggedIn) {
      await dispatch('getKeys'); // Fetch keypair from localStorage
      await dispatch('getName', axios);
    }
  },

  /**
   * Log in the user
   * @param {AxiosStatic} axios
   */
  async login ({ commit }, { axios, body }) {
    const token = await login(axios, { ...body });
    localStorage.setItem('isLoggedIn', true);
    await commit('set', { isLoggedIn: true });
    return token;
  },

  async getLoggedInState ({ commit }) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || false;
    await commit('set', { isLoggedIn });
  },
  async getKeys ({ commit }) {
    if (localStorage.getItem('keys')) {
      await commit('set', { keys: JSON.parse(localStorage.getItem('keys')) });
    }
  },
  /**
   * Retrieve and decrypt the user's name
   * @param {AxiosStatic} axios
   */
  async getName ({ commit, state }, axios) {
    let d;
    let displayName;
    if (state.isLoggedIn) {
      // Used cached displayname if available
      if (sessionStorage.getItem('displayName')) {
        commit('set', { displayName: sessionStorage.getItem('displayName') });
        return;
      }
      else {
        d = await getName(axios);
      }
    }
    else {
      // Don't make any API calls if the user isn't logged in
      commit('set', { displayName: '' });
      return;
    }

    // User with personal info that needs to be decrypted
    if (d.username || d.firstName || d.lastName) {
      const encodedPrivateKey = state.keys.privateKey;
      // Import the user's private key
      const privateKey = await importPrivateKey(encodedPrivateKey);

      // Decrypt relevant properties
      let firstName;
      let lastName;
      let username;
      if (d.firstName) {
        firstName = await privateDecrypt(d.firstName, privateKey);
      }
      if (d.lastName) {
        lastName = await privateDecrypt(d.lastName, privateKey);
      }
      if (d.username) {
        username = await privateDecrypt(d.username, privateKey);
      }

      // Formatting magic
      displayName = username || `${firstName || ''}${lastName ? ' ' + lastName : ''}`;
    }
    // Anonymous user
    else {
      displayName = 'Anonymous user';
    }
    // Cache the username in session storage
    sessionStorage.setItem('displayName', displayName);
    commit('set', { displayName });
  }
};
