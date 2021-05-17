import * as storage from '../assets/scripts/storage'
import Vue from 'vue'

export const state = () => ({
  userId: null,
  shipIds: [],
  ship: null,
  crewMember: null,
})

export const mutations = {
  set(state, updates) {
    for (let prop in updates) state[prop] = updates[prop]
  },

  updateShip(state, updates) {
    if (!state.ship) return
    for (let prop in updates)
      Vue.set(state.ship, prop, updates[prop])
    Vue.set(state.ship, `lastUpdated`, Date.now())
    state.crewMember = state.ship?.crewMembers?.find(
      (cm) => cm.id === state.userId,
    )
  },

  updateACrewMember(state, updates) {
    const crewMember = state.ship?.crewMembers?.find(
      (c) => c.id === updates?.id,
    )
    for (let prop in updates)
      Vue.set(crewMember, prop, updates[prop])
  },

  setRoom(state, target) {
    if (!state.crewMember) return
    Vue.set(state.crewMember, 'location', target)
    this.$socket?.emit(
      'crew:move',
      state.ship.id,
      state.userId,
      target,
    )
  },

  setTarget(state, target) {
    if (!state.crewMember) return
    Vue.set(state.crewMember, 'targetLocation', target)
    this.$socket?.emit(
      'crew:targetLocation',
      state.ship.id,
      state.userId,
      target,
    )
  },
}

export const actions = {
  async socketSetup({ state, commit }, shipId) {
    this.$socket.removeAllListeners()

    this.$socket.on(`disconnect`, () => {
      commit(`set`, { ship: null })
    })

    const connected = () => {
      this.$socket?.emit(`ship:listen`, shipId, (res) => {
        if (`error` in res) return console.log(res.error)
        commit(`set`, { ship: res.data })
      })
    }
    if (this.$socket.connected) connected()
    this.$socket.on(`connect`, connected)

    this.$socket.on(`ship:update`, ({ id, updates }) => {
      if (state.ship === null) connected()
      // console.log(updates)
      else commit(`updateShip`, { ...updates })
    })
  },

  logout({ commit }) {
    this.$socket.removeAllListeners()
    commit(`set`, { shipIds: [], userId: null })
    storage.remove(`userId`)
    storage.remove(`shipIds`)
  },
}
