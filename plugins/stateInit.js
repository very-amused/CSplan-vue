export default async function ({ store, app }) {
  await store.dispatch('user/init', app.$axios)
    .catch(() => {
      store.dispatch('user/logout', app.$axios);
    });
};
