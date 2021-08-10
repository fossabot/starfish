<template>
  <div class="pagecontainer">
    <div class="bg"></div>
    <FadeIn :off="ready">{{ c.GAME_NAME }}</FadeIn>
    <!-- <Starfield class="starfield" /> -->

    <div
      id="masonrycontainer"
      class="container"
      ref="container"
    >
      <ShipNoShip />

      <template v-if="ship && !ship.dead">
        <ShipSpectator />

        <ShipTutorial />

        <Ship />

        <ShipCanvasMap />
        <ShipPlanet />

        <ShipCanvasMapZoom />

        <ShipMemberInventory />

        <ShipDiagram />
        <ShipRoom />

        <ShipMember />

        <!-- <ShipVisible /> -->
        <ShipScanShip />

        <ShipItems />

        <ShipLog />

        <ShipCrewRank />

        <ShipFactionRank />

        <ShipNavPane v-if="!ship.tutorial" />
      </template>

      <ShipDead v-if="ship && ship.dead" />
    </div>

    <!-- <details
      style="position: relative; margin-bottom: 2em;"
    >
      <summary>Raw Data</summary>
      <pre>{{ JSON.stringify(ship, null, 2) }}</pre>
    </details> -->
  </div>
</template>

<script lang="ts">
import c from '../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}
import FreeMase from 'freemase'

export default {
  data(): ComponentShape {
    return {
      c,
      currentShipIndex: 0,
      masonryElement: null,
      ready: false,
    }
  },

  computed: {
    ...mapState([
      'ship',
      'userId',
      'shipIds',
      'shipsBasics',
      'crewMember',
      'connected',
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
      this.masonryElement?.position()
    },
    connected(this: ComponentShape) {
      this.masonryElement?.position()
    },
    userId(this: ComponentShape) {
      if (!this.userId) this.$router.push('/login')
    },
  },

  async mounted(this: ComponentShape) {
    if (!this.userId || !this.shipIds) {
      this.$store.dispatch('logIn', {
        userId: this.userId,
        shipIds: this.shipIds,
      })
    }
    this.changeShip(this.currentShipIndex)
    this.setUpMasonry()

    window.addEventListener('focus', () => {
      this.$store.dispatch('slowMode', false)
    })
    window.addEventListener('blur', () => {
      this.$store.dispatch('slowMode', true)
    })
  },

  methods: {
    changeShip(this: ComponentShape, index: number) {
      if (
        this.shipIds &&
        this.shipIds[index] &&
        (!this.ship || this.ship.id !== this.shipIds[index])
      )
        this.$store.dispatch(
          'socketSetup',
          this.shipIds[index],
        )
    },
    async setUpMasonry(this: ComponentShape) {
      if (this.masonryElement) return
      if (!this.$refs.container)
        return setTimeout(this.setUpMasonry, 100)
      this.masonryElement = new FreeMase(
        this.$refs.container,
        { centerX: true },
      )
      setTimeout(() => (this.ready = true), 200)
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
  background-image: url('/images/pageBackgrounds/bg2.jpg');
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  // filter: blur(0.1vw);
  opacity: 0.2;
}
.starfield {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
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
