export default function ({ store }) {
  store.commit('init');

  // Subscribe to store updates
  store.subscribe((mutation, state) => {
    // Store the state object as a JSON string
    localStorage.setItem('store', JSON.stringify(state));
  });
}
