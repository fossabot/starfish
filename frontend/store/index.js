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
  mapFollowingShip: true,

  adminPassword: false,
})

export const mutations = {
  set(state, updates) {
    for (let prop in updates) state[prop] = updates[prop]
  },

  tooltip(state, newTooltip) {
    state.tooltip = newTooltip
  },

  setShipProp(state, pair) {
    if (!state.ship) state.ship = {}
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

  setBasicsProp(state, { shipId, prop, value }) {
    const foundShip = state.shipsBasics.find(
      (s) => s.id === shipId,
    )
    if (foundShip) Vue.set(foundShip, prop, value)
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

  setMinePriority(state, rp) {
    if (!state.crewMember) return
    Vue.set(state.crewMember, `minePriority`, rp)
    this.$socket?.emit(
      `crew:minePriority`,
      state.ship.id,
      state.userId,
      rp,
    )
  },
}

export const actions = {
  async getAndSetShipDataById(
    { state, dispatch, commit },
    shipId,
  ) {
    if (!shipId) return

    this.$socket?.emit(
      `ship:listen`,
      shipId,
      state.userId,
      async (res) => {
        if (`error` in res) return c.log(res.error)
        // * first load (no visible)
        dispatch(`updateShip`, { ...res.data })
      },
    )
    this.$socket.on(`ship:update`, ({ id, updates }) => {
      if (state.ship === null) return connected()
      if (state.ship.id !== id) return
      // * visible update
      dispatch(`updateShip`, { ...updates })
      dispatch(`socketStop`)
    })
  },

  async socketStop({ state, commit, dispatch }) {
    this.$socket.removeAllListeners()
    // but we still want updates about new user ships
    dispatch(`watchUserId`)
  },

  async watchUserId({ state, commit, dispatch }) {
    // this will give us updates about new user ships
    this.$socket.emit(`user:listen`, state.userId)
    this.$socket.on(`user:reloadShips`, () => {
      // c.log(
      //   `Reloading ships due to game server instruction...`,
      // )
      commit(`set`, { shipIds: null })
      dispatch(`logIn`)
    })
  },

  async socketSetup({ state, dispatch, commit }, shipId) {
    this.$socket.removeAllListeners()
    if (!shipId)
      shipId = state.ship?.id || state.activeShipId

    // c.log(
    //   `setting up socket with id`,
    //   state.ship?.id,
    //   state.activeShipId,
    //   shipId,
    // )

    const previousShipId =
      state.ship?.id || state.activeShipId

    commit(`set`, { modal: null, activeShipId: shipId })
    storage.set(`activeShipId`, `${shipId}`)

    let connectionTimeout = setTimeout(() => {
      c.log(`red`, `Failed to connect to socket.`)
      commit(`set`, { ship: null, connected: false })
    }, 5000)

    this.$socket.on(`disconnect`, () => {
      commit(`set`, { ship: null, connected: false })
    })

    const connected = () => {
      clearTimeout(connectionTimeout)
      commit(`set`, { connected: true })

      dispatch(`watchUserId`)

      this.$socket.emit(
        `ship:listen`,
        shipId,
        state.userId,
        async (res) => {
          // * here we get the first full load of the ship's data
          if (`error` in res) {
            c.log(res.error, `Reloading ships...`)
            commit(`set`, {
              shipIds: null,
              activeShipId: null,
            })
            dispatch(`logIn`)
            return
          }
          // c.log(
          //   JSON.stringify(res.data).length,
          //   `characters of data received from initial load`,
          // )
          if (previousShipId !== res.data.id) {
            commit(`set`, { ship: null })
            await Vue.nextTick() // testing this to make sure data fully resets
            commit(`set`, { ship: res.data })
          }
          dispatch(`updateShip`, { ...res.data }) // this gets the crewMember for us
        },
      )
    }
    if (this.$socket.connected) connected()
    this.$socket.on(`connect`, connected)

    this.$socket.on(`ship:update`, ({ id, updates }) => {
      if (state.ship === null) return connected()
      if (state.ship.id !== id) return
      if (stillWorkingOnTick) return // c.log(`skipping tick because too busy`)
      // c.log(
      //   JSON.stringify(updates).length,
      //   `characters of data received from update`,
      // )
      // c.log(Object.keys(updates))

      stillWorkingOnTick = true
      dispatch(`updateShip`, { ...updates })

      setTimeout(
        () => (stillWorkingOnTick = false),
        c.tickInterval * 0.7,
      )
    })

    this.$socket.on(`ship:forwardTo`, (id) => {
      c.log(
        `forwarding from last ship id to new id!`,
        state.ship?.id,
        id,
      )
      dispatch(`socketSetup`, id, true)
    })
  },

  updateShip({ commit, state }, updates) {
    // c.log(`updating ship props`, Object.keys(updates))
    if (!state.ship) return

    const basicsIndex = state.shipsBasics?.findIndex(
      (s) => s.id === state.ship.id,
    )
    const basics = state.shipsBasics[basicsIndex]

    for (let prop in updates) {
      // update basics if relevant (i.e. name change)
      if (
        basics &&
        basics[prop] &&
        basics[prop] !== updates[prop]
      ) {
        commit(`setBasicsProp`, {
          shipId: basics.id,
          prop,
          value: updates[prop],
        })
      }

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
      } else if (prop === `visible` && updates.visible) {
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
      } else if (prop !== `visible`)
        commit(`setShipProp`, [prop, updates[prop]])
    }
    commit(`setShipProp`, [`lastUpdated`, Date.now()])
    commit(`set`, {
      lastUpdated: Date.now(),
      crewMember: state.ship?.crewMembers?.find(
        (cm) => cm.id === state.userId,
      ),
    })
  },

  respawn({ state, dispatch }) {
    if (!state.ship?.dead) return
    this.$socket?.emit(
      `ship:respawn`,
      state.ship.id,
      ({ data, error }) => {
        if (error) return c.log(error)
        dispatch(`updateShip`, { ...data, dead: false })
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
          c.log(`login error:`, idRes.error)
          return
        }
        userId = idRes.data
        c.log({ userId })
      }
      if (userId) storage.set(`userId`, userId)

      if (!shipIds) shipIds = state.shipIds
      if (!shipIds || !shipIds?.length) {
        try {
          const guildsRes = await discordAuth
            .loadUserGameGuilds({
              userId,
              socket: this.$socket,
              tokenType,
              accessToken,
            })
            .catch((e) => {
              c.log(
                `error loading game guilds from discord api`,
                e,
              )
            })

          if (guildsRes.error) {
            dispatch(`notifications/notify`, {
              text: guildsRes.error,
              type: `error`,
            })

            if (guildsRes.error === `Bad token`) {
              // dispatch(`logout`)
              // this.$router.push(`/login`)
              return
            }

            c.log(`login error!`, guildsRes.error)
            return
          }

          shipIds = guildsRes.data
        } catch (e) {
          c.log(
            `failed to get ship ids from discord api`,
            e,
          )
          return
        }
      }
      if (shipIds)
        storage.set(`shipIds`, JSON.stringify(shipIds))
    }

    // c.log(`logging in`, { userId, shipIds })

    commit(`set`, { userId, shipIds })

    const shipsBasics = []
    for (let id of shipIds) {
      await new Promise((resolve) => {
        this.$socket?.emit(
          `ship:basics`,
          id,
          ({ data, error }) => {
            if (error) {
              c.log(`ship basics error:`, error)
              // something's up with one of the guilds, so reset the whole deal
              storage.remove(`shipIds`)
              commit(`set`, { shipIds: [] })
              dispatch(`logIn`, { userId })
              resolve()
              return
            }
            shipsBasics.push(data)
            resolve()
          },
        )
      })
    }
    commit(`set`, { shipsBasics })
  },

  logout({ commit, dispatch }) {
    this.$router.push(`/`)
    this.$socket.removeAllListeners()
    commit(`set`, {
      shipIds: [],
      userId: null,
      shipsBasics: [],
      ship: null,
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
      // c.log(`slow mode on`)
      dispatch(`socketStop`)
      slowModeUpdateInterval = setInterval(() => {
        // c.log(`slow mode update`)
        dispatch(
          `getAndSetShipDataById`,
          state.ship?.id || state.activeShipId,
        )
      }, 60 * 1000)
    } else {
      // c.log(`slow mode off`)
      slowModeUpdateInterval = null
      dispatch(`socketSetup`)
    }
  },
}
