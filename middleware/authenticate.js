export default function ({ store, redirect }) {
  // Don't access the state before clientside render
  if (process.client && !store.state.user.isLoggedIn) {
    redirect('/');
  }
};
