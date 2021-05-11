import * as storage from '../assets/scripts/storage'
import Vue from 'vue'

export const state = () => ({
  userId: null,
  shipIds: [],
  ship: null,
})

export const mutations = {
  set(state, updates) {
    for (let prop in updates) state[prop] = updates[prop]
  },

  updateShip(state, updates) {
    if (!state.ship) return
    for (let prop in updates)
      Vue.set(state.ship, prop, updates[prop])
    Vue.set(state.ship, 'lastUpdated', Date.now())
  },
  updateCrewMember(state, updates) {
    const crewMember = state.ship?.crewMembers?.find(
      (c) => c.id === updates?.id,
    )
    for (let prop in updates)
      Vue.set(crewMember, prop, updates[prop])
  },
}

export const actions = {
  async socketSetup({ commit }, shipId) {
    this.$socket.removeAllListeners()

    this.$socket.on('disconnect', () => {
      console.log('dc')
      commit('set', { ship: null })
    })

    const connected = () => {
      this.$socket?.emit('ship:listen', shipId, (res) => {
        if ('error' in res) return console.log(res.error)
        commit('set', { ship: res.data })
      })
    }
    if (this.$socket.connected) connected()
    this.$socket.on('connect', connected)

    this.$socket.on('ship:update', ({ id, updates }) => {
      commit('updateShip', { ...updates })
    })
  },

  logout({ commit }) {
    this.$socket.removeAllListeners()
    commit('set', { shipIds: [], userId: null })
    storage.remove('userId')
    storage.remove('shipIds')
  },
}
