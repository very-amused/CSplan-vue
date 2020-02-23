/**
 * @typedef {Object} Keys
 * @property {string} publicKey - Base64 encoded RSA public key
 * @property {string} privateKey - Base64 encoded RSA private key
 */

export const state = () => ({
  token: '',
  keys: {
    publicKey: '',
    privateKey: ''
  }
});

export const mutations = {
  /**
   * Set the user's authentication token
   * @param state - Vuex state
   * @param {string} token - Authentication token
   */
  setToken (state, token) {
    state.token = token;
  },
  /**
   * Set the user's keypair
   * @param state - Vuex state
   * @param {Keys} keys - Keypair for the user
   */
  setKeys (state, keys) {
    state.keys = { ...keys };
  }
};
