<template>
  <div class="pagecontainer">
    <FadeIn :off="ready">
      <div class="flexcenter flexcolumn">
        <img
          src="/images/logo.svg"
          class="fadeinlogo marbotsmall"
        /></div
    ></FadeIn>

    <div
      id="masonrycontainer"
      class="container"
      ref="container"
    >
      <ShipNoShip />

      <template v-if="ship && !ship.dead">
        <ShipSpectator v-if="!ship.tutorial" />

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

        <ShipPassives />
        <!-- <ShipStats /> -->

        <ShipCrewRank />

        <ShipFactionRank />
      </template>

      <template v-if="ship && ship.dead">
        <ShipDead />
        <ShipLog />
      </template>

      <ShipNavPane v-if="ship && !ship.tutorial" />
    </div>
    <!-- {{ ship && ship.id }}
    {{ ship && ship.tutorial }} -->
    <!-- {{ ship && ship.dead }}
    <pre>{{ crewMember }}</pre> -->

    <!-- <details style="position: relative; margin-bottom: 2em">
      <summary>Raw Data</summary>
      <pre>{{ JSON.stringify(ship, null, 2) }}</pre>
    </details> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
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
      if (!this.userId) (this as any).$router.push('/login')
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

    setTimeout(() => (this.ready = true), 6000)
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
        {
          centerX: true,
        },
      )
    },
  },
})
</script>

<style lang="scss" scoped>
.fadeinlogo {
  width: 50px;
  animation: spin 5s infinite linear;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}

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
