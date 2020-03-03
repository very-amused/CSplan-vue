// eslint-disable-next-line
import AxiosStatic from 'axios';

/**
 * @typedef {Object} NameBody - JSON body representing a user's identifying name
 * @property {?string} firstName - The user's given first name
 * @property {?string} lastName - The user's given last name
 * @property {?string} username - A pseudonym the user has chosen to be referred to by
 */

/**
 * Set a user's first + last name and/or username
 * @param {AxiosStatic} axios - Nuxt Axios instance
 * @param {NameBody} body - Form body to submit to the server
 */
export async function setName (axios, body) {
  const response = await axios({
    method: 'PUT',
    url: '/API/me/name',
    data: body,
    headers: {
      'X-Encrypt': false
    }
  })
    .catch((err) => {
      throw err.response || err;
    });

  return response;
}

/**
 *
 * @param {AxiosStatic} axios - Nuxt Axios instance
 * @returns {Promise<NameBody>} Object containing the user's first, last, and/or username
 */
export async function getName (axios) {
  const response = await axios({
    method: 'GET',
    url: '/API/me/name',
    headers: {
      'X-Decrypt': false
    }
  })
    .catch((err) => {
      throw err.response || err;
    });

  return response.data.data;
}
