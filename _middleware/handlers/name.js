import AxiosStatic from 'axios'; // eslint-disable-line
import store from 'vuex'; // eslint-disable-line

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
    method: 'PATCH',
    url: '/v1/account/name',
    data: body
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
    url: '/v1/account/name'
  })
    .catch((err) => {
      throw err.response || err;
    });

  return response.data.data;
}
