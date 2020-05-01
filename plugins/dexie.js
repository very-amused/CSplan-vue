import Dexie from 'dexie';

const db = new Dexie('CSplan');
// Schema goes here
db.version(1).stores({
  todos: 'id, title',
  categories: 'id, title',
  user: 'id'
});

export default ({ app }, inject) => {
  inject('dexie', db);
};
