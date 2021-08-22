<template>
  <div class="pagecontainer">
    <div class="bg"></div>
    <FadeIn :off="ready">{{ c.gameName }}</FadeIn>
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

    <details style="position: relative; margin-bottom: 2em">
      <summary>Raw Data</summary>
      <pre>{{ JSON.stringify(ship, null, 2) }}</pre>
    </details>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/src'
import { mapState } from 'vuex'
import * as storage from '../../assets/scripts/storage'

import FreeMase from 'freemase'

export default Vue.extend({
  data() {
    let masonryElement: FreeMase | undefined
    return {
      masonryElement,
      ready: false,
      c,
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
      'activeShipId',
      'lastUpdated',
    ]),
    planet(): PlanetStub {
      return this.ship?.planet
    },
    room(): CrewLocation {
      return this.crewMember?.location
    },
  },

  watch: {
    shipIds(): void {
      if (!this.activeShipId) this.changeShip(0)
    },
    ship(): void {
      this.masonryElement?.position()
    },
    connected(): void {
      this.masonryElement?.position()
    },
    userId(): void {
      if (!this.userId) this.$router.push('/login')
    },
    lastUpdated(): void {
      setTimeout(() => (this.ready = true), 800)
    },
  },

  async mounted(): Promise<void> {
    if (!this.userId || !this.shipIds) {
      this.$store.dispatch('logIn', {
        userId: this.userId,
        shipIds: this.shipIds,
      })
    }
    const storedActiveId = storage.get('activeShipId')
    if (storedActiveId)
      this.changeShip(false, storedActiveId)
    else this.changeShip(0)
    this.setUpMasonry()

    window.addEventListener('focus', () => {
      this.$store.dispatch('slowMode', false)
    })
    window.addEventListener('blur', () => {
      this.$store.dispatch('slowMode', true)
    })
  },

  methods: {
    changeShip(index: number | false, id?: string): void {
      // c.log(id, index, this.ship?.id)
      if (id && (!this.ship || this.ship.id !== id))
        this.$store.dispatch('socketSetup', id)
      else if (
        index !== false &&
        this.shipIds &&
        this.shipIds[index] &&
        (!this.ship || this.ship.id !== this.shipIds[index])
      ) {
        this.$store.dispatch(
          'socketSetup',
          this.shipIds[index],
        )
      }
    },

    async setUpMasonry(): Promise<void> {
      if (this.masonryElement) return
      if (!this.$refs.container) {
        setTimeout(() => this.setUpMasonry(), 100)
        return
      }
      this.masonryElement = new FreeMase(
        this.$refs.container as HTMLElement,
        { centerX: true },
      )
    },
  },
})
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
