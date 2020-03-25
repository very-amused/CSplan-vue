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
 * @returns {string} Unique identifier for the todo list
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

  return response.data.data.id;
}

/**
 * Add item(s) to an existing todo list
 * @param {AxiosStatic} axios
 * @param {string} id - The id of the parent todo list
 * @param {TodoItem[]} items
 */
export async function addItems (axios, id, items) {
  const data = {
    type: 'todo-items',
    attributes: {
      items
    }
  };

  const response = await axios({
    method: 'POST',
    url: `/v1/todos/${id}/items`,
    data: { data }
  });

  return response.data.data.id;
}
