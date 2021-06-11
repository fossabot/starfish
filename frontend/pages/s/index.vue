<template>
  <div class="pagecontainer">
    <div class="bg"></div>
    <FadeIn :off="ready">{{ c.GAME_NAME }}</FadeIn>
    <!-- <Starfield /> -->

    <Box v-if="!ship || !crewMember">
      No ship found by the ID(s) you have saved! If you're
      sure that your server still has a ship in the game,
      try logging out and back in. If that doesn't fix it,
      please reach out on the support server.
    </Box>

    <div
      id="masonrycontainer"
      class="container"
      ref="container"
      v-if="ship && crewMember && !ship.dead"
    >
      <ShipTutorial />
      <Ship />

      <ShipMemberInventory />

      <ShipMapPlayermapDefault />
      <ShipMapPlayermapZoom />

      <ShipPlanet />

      <ShipDiagram />
      <ShipRoom />

      <ShipMember />

      <!-- <ShipVisible /> -->
      <ShipScanShip />

      <ShipLog />

      <ShipItems />
      <ShipCrewRank />

      <ShipFactionRank />

      <NavBar v-if="!ship.tutorial" />
    </div>
    <div class="box dead" v-if="ship && ship.dead">
      <h5>U dead</h5>
      <button
        v-if="this.ship.captain === this.userId"
        @click="$store.dispatch('respawn')"
      >
        Respawn
      </button>
    </div>

    <details
      style="position: relative; margin-bottom: 2em;"
    >
      <summary>Raw Data</summary>
      <pre>{{ JSON.stringify(ship, null, 2) }}</pre>
    </details>
  </div>
</template>

<script lang="ts">
import c from '../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  resizeObserver: ResizeObserver | null
  mutationObserver: MutationObserver | null
  [key: string]: any
}
import { FreeMase } from '../../../common/src/FreeMase/FreeMase'

export default {
  data(): ComponentShape {
    return {
      c,
      currentShipIndex: 0,
      resizeObserver: null,
      mutationObserver: null,
      masonryElement: null,
      ready: false,
    }
  },

  computed: {
    ...mapState([
      'ship',
      'userId',
      'shipIds',
      'crewMember',
    ]),
    planet(this: ComponentShape) {
      return this.ship?.planet
    },
    room(this: ComponentShape) {
      return this.crewMember?.location
    },
  },

  watch: {
    shipIds(this: ComponentShape) {
      if (this.shipIds?.length) {
        this.changeShip(this.currentShipIndex)
      }
    },
    currentShipIndex(this: ComponentShape) {
      this.changeShip(this.currentShipIndex)
    },
    ship(this: ComponentShape) {
      this.masonryElement = null
      this.resizeObserver = null
    },
  },

  async mounted(this: ComponentShape) {
    if (!this.userId) {
      this.$router.push('/login')
      return
    }
    this.changeShip(this.currentShipIndex)
    this.setUpObservers()
    setTimeout(() => (this.ready = true), 2000)
  },

  methods: {
    async setUpObservers(this: ComponentShape) {
      if (
        (this.$refs.container?.children?.length || 0) < 1
      ) {
        return setTimeout(this.setUpObservers, 100)
      }
      // todo need to be able to handle new elements getting appended

      await this.$nextTick()

      const alreadyWatchingForResize: Element[] = []

      if (this.resizeObserver && this.mutationObserver)
        return
      let ready = false
      const mutateCallback = c.debounce(
        (els?: MutationRecord[]) => {
          if (!ready) return
          if (els)
            els.forEach((entry) => {
              const parentEl = entry.target as Element
              if (!parentEl) return
              // c.log('mutated', parentEl)
              Array.from(parentEl.children).forEach(
                (childEl) => {
                  if (
                    alreadyWatchingForResize.includes(
                      childEl,
                    )
                  )
                    return
                  // c.log(
                  //   'already watching',
                  //   childEl,
                  // )
                  if (this.resizeObserver)
                    this.resizeObserver.observe(childEl)
                  c.log('now watching for resize:', childEl)
                  alreadyWatchingForResize.push(childEl)
                },
              )
            })
          this.$nextTick(this.resetMasonry)
        },
        200,
      )

      const resizeCallback = c.debounce(
        (els?: ResizeObserverEntry[]) => {
          // c.log('resized', els)
          if (!ready) return
          this.$nextTick(this.resetMasonry)
        },
        200,
      )

      this.mutationObserver = new MutationObserver(
        mutateCallback,
      )
      this.mutationObserver.observe(this.$refs.container, {
        childList: true,
      })

      this.resizeObserver = new ResizeObserver(
        resizeCallback,
      )
      for (let child of this.$refs.container.children) {
        if (child.$el) child = child.$el
        this.resizeObserver.observe(child)
        alreadyWatchingForResize.push(child)
      }
      ready = true
      resizeCallback()
    },
    changeShip(this: ComponentShape, index: number) {
      if (
        this.shipIds[index] &&
        (!this.ship || this.ship.id !== this.shipIds[index])
      )
        this.$store.dispatch(
          'socketSetup',
          this.shipIds[index],
        )
    },
    async resetMasonry(this: ComponentShape) {
      if (!this.resizeObserver) return this.setUpObservers()
      if (!this.$refs.container || !window)
        return setTimeout(this.resetMasonry, 500)

      if (!this.masonryElement) {
        this.masonryElement = new FreeMase(
          this.$refs.container,
        )
        setTimeout(() => (this.ready = true), 500)
      } else this.masonryElement.position()
    },
  },
}
</script>

<style lang="scss" scoped>
.pagecontainer {
  width: 100%;
  min-height: 100vh;
  position: relative;
  // display: flex;
  // align-items: center;
  // justify-content: center;
  // flex-direction: column;

  & > * {
    max-width: 100%;
  }
}

.bg {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-image: url('/bg1.png');
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  filter: blur(0.1vw);
  opacity: 0.3;
}

.container {
  display: inline-block;
  position: relative;
  margin: 0 auto;

  & > * {
    display: inline-block;
    transition: top 0.5s ease-in-out, left 0.5s ease-in-out,
      opacity 1s;
    margin-bottom: 0px;
    opacity: 0;

    @media (max-width: 768px) {
      width: 100% !important;
    }
  }
}

.dead {
  position: relative;
}
</style>
