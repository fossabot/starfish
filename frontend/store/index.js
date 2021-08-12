import c from '../../common/dist'
import * as storage from '../assets/scripts/storage'
import * as discordAuth from '../assets/scripts/discordAuth'
import Vue from 'vue'

let stillWorkingOnTick = false
let slowModeUpdateInterval = null

export const state = () => ({
  lastUpdated: 0,
  connected: false,
  userId: null,
  shipIds: [],
  shipsBasics: [],
  activeShipId: null,
  ship: null,
  crewMember: null,
  tooltip: null,
  winSize: [1200, 1000],
  modal: null,
  forceMapRedraw: 0,
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
    state.forceMapRedraw++
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

    if (
      !shipId ||
      !state.shipIds.find((s) => s === shipId)
    ) {
      return // c.log(`Skipping setup: invalid ship id`)
    }

    commit(`set`, { modal: null, activeShipId: shipId })
    storage.set(`activeShipId`, `${shipId}`)

    this.$socket.on(`disconnect`, () => {
      commit(`set`, { ship: null, connected: false })
    })

    const connected = () => {
      commit(`set`, { connected: true })
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
      } else if (prop === `visible`) {
        // * planets send only the things that updated, so we update that here
        if (!state.ship?.visible)
          commit(`setShipProp`, [
            `visible`,
            updates.visible,
          ])
        else {
          const newVisible = { ...updates.visible }
          newVisible.planets = [
            ...(state.visible?.planets || []),
          ]
          for (let updatedPlanet of updates.visible
            ?.planets || []) {
            const existingData = newVisible.planets.find(
              (p) => updatedPlanet.name === p.name,
            )
            if (!existingData)
              newVisible.planets.push(updatedPlanet)
            else
              for (let prop in updatedData)
                existingData[prop] = updatedPlanet[prop]
          }
          commit(`setShipProp`, [`visible`, newVisible])
        }
      } else commit(`setShipProp`, [prop, updates[prop]])
    }
    commit(`setShipProp`, [`lastUpdated`, Date.now()])
    commit(`set`, {
      lastUpdated: Date.now(),
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

  async logIn(
    { commit, state, dispatch },
    { userId, shipIds } = {},
  ) {
    if (!userId || !shipIds || !shipIds?.length) {
      const tokenType = storage.get(`tokenType`)
      const accessToken = storage.get(`accessToken`)
      if (!tokenType || !accessToken)
        return this.$router.push(`/login`)

      if (!userId) userId = state.userId
      if (!userId) {
        const idRes = await discordAuth.getUserId({
          tokenType,
          accessToken,
        })
        if (idRes.error) {
          dispatch(`notifications/notify`, {
            text: idRes.error,
            type: `error`,
          })
          c.log(idRes.error)
          return
        }
        userId = idRes.data
      }
      if (userId) storage.set(`userId`, userId)

      if (!shipIds) shipIds = state.shipIds
      if (!shipIds || !shipIds?.length) {
        const guildsRes = await discordAuth.loadUserGameGuilds(
          {
            userId,
            socket: this.$socket,
            tokenType,
            accessToken,
          },
        )
        if (guildsRes.error) {
          dispatch(`notifications/notify`, {
            text: guildsRes.error,
            type: `error`,
          })
          c.log(guildsRes.error)

          if (guildsRes.error === `Bad token`) {
            c.log(
              `failed!`,
              guildsRes,
              tokenType,
              accessToken,
              userId,
            )
            // dispatch(`logout`)
            // this.$router.push(`/login`)
            return
          }
          return
        }

        shipIds = guildsRes.data
      }
      if (shipIds)
        storage.set(`shipIds`, JSON.stringify(shipIds))
    }

    commit(`set`, { userId, shipIds })

    this.$router.push(`/s`)

    if (shipIds?.length > 1) {
      const shipsBasics = []
      for (let id of shipIds) {
        await new Promise((resolve) => {
          this.$socket?.emit(
            `ship:basics`,
            id,
            ({ data, error }) => {
              if (error) {
                // something's up with one of the guilds, so reset the whole deal
                storage.remove(`shipIds`)
                commit(`set`, { shipIds: [] })
                dispatch(`logIn`, { userId })
                resolve()
                return c.log(error)
              }
              shipsBasics.push(data)
              resolve()
            },
          )
        })
      }
      commit(`set`, { shipsBasics })
    }
  },

  logout({ commit }) {
    this.$router.push(`/`)
    this.$socket.removeAllListeners()
    commit(`set`, {
      shipIds: [],
      userId: null,
      shipsBasics: null,
    })
    storage.remove(`userId`)
    storage.remove(`shipIds`)
    dispatch(`notifications/notify`, {
      text: `Logged out.`,
      type: `success`,
    })
  },

  slowMode({ state, dispatch }, turnOn) {
    clearInterval(slowModeUpdateInterval)
    if (turnOn) {
      c.log(`slow mode on`)
      dispatch(`socketSetup`, null)
      slowModeUpdateInterval = setInterval(() => {
        c.log(`slow mode update`)
        dispatch(`socketSetup`, state.activeShipId)
        setTimeout(() => {
          if (slowModeUpdateInterval)
            dispatch(`socketSetup`, null)
        }, 2 * 1000)
      }, 60 * 1000)
    } else {
      c.log(`slow mode off`)
      dispatch(`socketSetup`, state.activeShipId)
    }
  },
}
