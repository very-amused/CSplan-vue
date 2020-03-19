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
  const data = {
    type: 'user',
    attributes: {
      email: user.email,
      password: user.password
    }
  };

  // Post the user's info to the API
  const response = await axios({
    method: 'POST',
    url: '/v1/register',
    data: { data }
  })
    .catch((err) => {
      throw err.response || err;
    });
  return response;
}

/**
 * @param {AxiosStatic} axios - Nuxt Axios instance
 * @param {UserBody} user
 * @returns {Promise<string>} The user's authentication token, valid for 1 week
 */
export async function login (axios, user) {
  const data = {
    type: 'user',
    attributes: {
      email: user.email,
      password: user.password
    }
  };

  const response = await axios({
    method: 'POST',
    url: '/v1/login',
    data: { data }
  })
    .catch((err) => {
      throw err.response || err;
    });

  return response.data.data.id;
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
  const data = {
    type: 'keydata',
    attributes: {
      PBKDF2salt,
      publicKey: keys.publicKey,
      // Only the encrypted version of the private key is sent to the server
      privateKey: keys.encryptedPrivateKey
    }
  };

  const response = await axios({
    method: 'POST',
    url: '/v1/account/keys',
    data: { data }
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
    url: '/v1/logout'
  })
    .catch((err) => {
      throw err.response || err;
    });

  return response;
}
