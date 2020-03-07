// eslint-disable-next-line
import AxiosStatic from 'axios';

/**
 * @typedef {Object} UserBody - HTTP body containing JSON information to register or authorize a user
 * @property {string} email - The user's email account
 * @property {string} password - The user's plaintext password
 */

/**
 * Register a user's new account
 * @param {AxiosStatic} axios - Nuxt Axios instance
 * @param {UserBody} user
 * @returns {Promise} Axios Response
 */
export async function register (axios, user) {
  // Post the user's info to the API
  const response = await axios({
    method: 'POST',
    url: '/API/register',
    data: {
      email: user.email,
      password: user.password
    }
  })
    .catch((err) => {
      throw err.response || err;
    });
  return response;
}

/**
 * @param {AxiosStatic} axios - Nuxt Axios instance
 * @param store - VueX store
 * @param {UserBody} user
 * @returns {Promise<string>} The user's authentication token, valid for 1 week
 */
export async function login (axios, store, user) {
  const response = await axios({
    method: 'POST',
    url: '/API/login',
    data: user
  })
    .catch((err) => {
      throw err.response || err;
    });

  // Alert components that the user has been logged in
  store.commit('user/login');

  return response.data.data.token;
}

/**
 * @typedef {Object} Keys
 * @property {string} publicKey - RSA public key exported as SPKI and encoded with Base64
 * @property {string} privateKey - RSA private key exported as pkcs8 and encoded with Base64
 * @property {string} encryptedPrivateKey - RSA private key exported as pkcs8,
 * encrypted using AES-GCM, and encoded with Base64
 */

/**
 *
 * @param {AxiosStatic} axios - Nuxt Axios instance
 * @param {Keys} keys - RSA keypair
 * @param {string} PBKDF2salt - Salt used in PBKDF2 generation of the private key decryptor
 * @returns {Promise} Axios response
 */
export async function storeKeypair (axios, keys, PBKDF2salt) {
  const response = await axios({
    method: 'POST',
    url: '/API/me/keys',
    data: {
      PBKDF2salt,
      publicKey: keys.publicKey,
      // Only the encrypted version of the private key is sent to the server
      privateKey: keys.encryptedPrivateKey
    },
    headers: {
      // Directive tells the server to not encrypt the information
      'X-Encrypt': false
    }
  })
    .catch((err) => {
      throw err.response || err;
    });

  return response;
};

/**
 * Log the user out
 * @param {AxiosStatic} axios
 */
export async function logout (axios) {
  // Clear any cached or stored data
  localStorage.clear();
  sessionStorage.clear();

  // Logout the user from the API
  const response = await axios({
    method: 'POST',
    url: '/API/logout'
  })
    .catch((err) => {
      throw err.response || err;
    });

  return response;
}
