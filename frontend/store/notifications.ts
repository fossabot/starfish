export const state = () => ({
  list: [],
})

export const mutations = {
  add(state, notification) {
    state.list.push(notification)
  },

  remove(state) {
    state.list.shift()
  },
}

export const actions = {
  notify({ commit }, notification) {
    if (!notification.text) return
    commit(`add`, notification)
    setTimeout(() => commit(`remove`), 6000)
  },
}
