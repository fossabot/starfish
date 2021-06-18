import c from '../../common/dist'
import * as storage from '../assets/scripts/storage'
import Vue from 'vue'

let stillWorkingOnTick = false

export const state = () => ({
  userId: null,
  shipIds: [],
  ship: null,
  crewMember: null,
  tooltip: null,
  winSize: [1200, 1000],
  modal: null,
})

export const mutations = {
  set(state, updates) {
    for (let prop in updates) state[prop] = updates[prop]
  },

  tooltip(state, text) {
    state.tooltip = text
  },

  setShipProp(state, pair) {
    Vue.set(state.ship, pair[0], pair[1])
  },

  updateACrewMember(state, updates) {
    const crewMember = state.ship?.crewMembers?.find(
      (c) => c.id === updates?.id,
    )
    if (!crewMember) state.ship?.crewMembers?.push(updates)
    else
      for (let prop in updates)
        Vue.set(crewMember, prop, updates[prop])
  },

  setRoom(state, target) {
    if (!state.crewMember) return
    Vue.set(state.crewMember, `location`, target)
    this.$socket?.emit(
      `crew:move`,
      state.ship.id,
      state.userId,
      target,
    )
  },

  setTarget(state, target) {
    if (!state.crewMember) return
    Vue.set(state.crewMember, `targetLocation`, target)
    this.$socket?.emit(
      `crew:targetLocation`,
      state.ship.id,
      state.userId,
      target,
    )
  },

  setTactic(state, tactic) {
    if (!state.crewMember) return
    Vue.set(state.crewMember, `tactic`, tactic)
    this.$socket?.emit(
      `crew:tactic`,
      state.ship.id,
      state.userId,
      tactic,
    )
  },

  setAttackTarget(state, target) {
    if (!state.crewMember) return
    Vue.set(state.crewMember, `attackTarget`, {
      id: target,
    })
    this.$socket?.emit(
      `crew:attackTarget`,
      state.ship.id,
      state.userId,
      target,
    )
  },

  setItemTarget(state, target) {
    if (!state.crewMember) return
    Vue.set(state.crewMember, `itemTarget`, target)
    this.$socket?.emit(
      `crew:itemTarget`,
      state.ship.id,
      state.userId,
      target,
    )
  },

  setRepairPriority(state, rp) {
    if (!state.crewMember) return
    Vue.set(state.crewMember, `repairPriority`, rp)
    this.$socket?.emit(
      `crew:repairPriority`,
      state.ship.id,
      state.userId,
      rp,
    )
  },
}

export const actions = {
  async socketSetup({ state, dispatch, commit }, shipId) {
    this.$socket.removeAllListeners()

    this.$socket.on(`disconnect`, () => {
      commit(`set`, { ship: null })
    })

    const connected = () => {
      this.$socket?.emit(`ship:listen`, shipId, (res) => {
        if (`error` in res) return console.log(res.error)
        commit(`set`, { ship: res.data })
        dispatch(`updateShip`, { ...res.data }) // this gets the crewMember for us
      })
    }
    if (this.$socket.connected) connected()
    this.$socket.on(`connect`, connected)

    this.$socket.on(`ship:update`, ({ id, updates }) => {
      if (state.ship === null) return connected()
      if (state.ship.id !== id) return
      if (stillWorkingOnTick) return // c.log(`skipping tick because too busy`)
      // c.log(updates)

      stillWorkingOnTick = true
      dispatch(`updateShip`, { ...updates })

      setTimeout(
        () => (stillWorkingOnTick = false),
        c.TICK_INTERVAL * 0.7,
      )
    })
  },

  updateShip({ commit, state }, updates) {
    // c.log(`updating ship props`, Object.keys(updates))
    if (!state.ship) return
    for (let prop in updates) {
      if (prop === `crewMembers`) {
        const existingMembers = state.ship.crewMembers
        if (!existingMembers)
          commit(`setShipProp`, [
            `crewMembers`,
            updates.crewMembers,
          ])
        updates.crewMembers.forEach((cmStub) =>
          commit(`updateACrewMember`, cmStub),
        )
      } else commit(`setShipProp`, [prop, updates[prop]])
    }
    commit(`setShipProp`, [`lastUpdated`, Date.now()])
    commit(`set`, {
      crewMember: state.ship?.crewMembers?.find(
        (cm) => cm.id === state.userId,
      ),
    })
  },

  respawn({ state, commit }) {
    if (!state.ship?.dead) return
    this.$socket?.emit(
      `ship:respawn`,
      state.ship.id,
      ({ data, error }) => {
        if (error) return console.log(error)
        commit(`updateShip`, { ...data, dead: false })
      },
    )
  },

  logout({ commit }) {
    this.$socket.removeAllListeners()
    commit(`set`, { shipIds: [], userId: null })
    storage.remove(`userId`)
    storage.remove(`shipIds`)
  },
}
