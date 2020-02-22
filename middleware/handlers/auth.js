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
 * @returns {AxiosPromise} Axios Response
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
 * @param {UserBody} user
 * @returns {Promise<string>} The user's authentication token, valid for 1 week
 */
export async function login (axios, user) {
  const response = await axios({
    method: 'POST',
    url: '/API/login',
    data: {
      email: user.email,
      password: user.password
    }
  })
    .catch((err) => {
      throw err.response || err;
    });

  return response.data.data.token;
}
