import AxiosStatic from 'axios'; // eslint-disable-line
import store from 'vuex'; // eslint-disable-line

/**
 * @typedef {object} TodoItem
 * @property {string} title
 * @property {?string} description
 * @property {string} color
 */

/**
 * @typedef {object} ListBody
 * @property {string} title
 * @property {TodoItem[]} items
 */

/**
 *
 * @param {AxiosStatic} axios
 * @param {ListBody} body
 * @returns {Promise<object>} ID and checksum
 */
export async function addList (axios, body) {
  const data = {
    type: 'todo-list',
    attributes: {
      title: body.title,
      items: body.items
    },
    meta: {
      cryptoKey: body.cryptoKey
    }
  };

  const response = await axios({
    method: 'POST',
    url: '/v1/todos',
    data: { data }
  });

  return {
    id: response.data.data.id,
    checksum: response.data.data.meta.checksum
  };
}

/**
 * Add an item to an existing todo list
 * @param {AxiosStatic} axios
 * @param {string} id - The id of the parent todo list
 * @param {TodoItem[]} items
 */
export async function addItem (axios, id, item) {
  const data = {
    type: 'todo-item',
    attributes: {
      ...item
    }
  };

  const response = await axios({
    method: 'POST',
    url: `/v1/todos/${id}/items`,
    data: { data }
  });

  return response.data.data.id;
}
