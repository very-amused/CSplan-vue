const initialState = () => {
  return {
    keyboardMode: false
  };
};

export const state = initialState();

export const mutations = {
  setKeyboardMode (state, bool) {
    state.keyboardMode = bool;
  }
};

export const actions = {
  async init ({ commit }) {
    const settings = await this.$dexie.settings.toCollection().first();
    if (settings) {
      commit('setKeyboardMode', settings.keyboardMode);
    }
  },

  async toggleKeyboardMode ({ commit, state, rootState }) {
    commit('setKeyboardMode', !state.keyboardMode);
    await this.$dexie.settings.update(rootState.user.id, { keyboardMode: state.keyboardMode });
  }
};
