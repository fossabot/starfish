<template>
  <div>
    <div class="bg"></div>
    <FadeIn :off="ready">{{ c.GAME_NAME }}</FadeIn>
    <!-- <Starfield /> -->

    <div class="box" v-if="!ship || !crewMember">
      No ship found by the ID(s) you have saved! If you're
      sure that your server still has a ship in the game,
      try logging out and back in. If that doesn't fix it,
      please reach out on the support server.
    </div>

    <div
      id="masonrycontainer"
      class="container"
      ref="container"
      v-if="ship && crewMember && !ship.dead"
    >
      <Ship class="grid-item" />
      <ShipMapPlayermapzoom class="grid-item" />

      <ShipMapPlayermap class="grid-item" />

      <ShipLog class="grid-item" />

      <ShipPlanet class="grid-item" />
      <ShipVisible class="grid-item" />
      <ShipScanShip class="grid-item" />

      <ShipMember class="grid-item" />
      <ShipDiagram class="grid-item" />
      <ShipRoom class="grid-item" />

      <ShipItems class="grid-item" />
      <ShipCrewRank class="grid-item" />

      <ShipFactionRank class="grid-item" />

      <NavBar class="grid-item" />
    </div>
    <div class="box" v-if="ship && ship.dead">
      <h5>U dead</h5>
      <button
        v-if="this.ship.captain === this.userId"
        @click="$store.dispatch('respawn')"
      >
        Respawn
      </button>
    </div>

    <details>
      <summary>Raw Data</summary>
      <pre v-if="ship">{{
        JSON.stringify(ship, null, 2)
      }}</pre>
    </details>
  </div>
</template>

<script lang="ts">
import c from '../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  resizeObserver: ResizeObserver | null
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return {
      c,
      currentShipIndex: 0,
      resizeObserver: null,
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
    this.setUpObserver()
    setTimeout(() => (this.ready = true), 2000)
  },

  methods: {
    async setUpObserver(this: ComponentShape) {
      if (
        (this.$refs.container?.children?.length || 0) < 10
      ) {
        return setTimeout(this.setUpObserver, 100)
      }

      await this.$nextTick()

      if (this.resizeObserver) return
      this.resizeObserver = new ResizeObserver(
        (entries) => {
          // console.log('resize')
          this.$nextTick(this.resetMasonry)
        },
      )
      for (let child of this.$refs.container.children) {
        if (child.$el) child = child.$el
        this.resizeObserver.observe(child)
      }
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
      if (!this.resizeObserver) return this.setUpObserver()
      if (
        !this.$refs.container ||
        !this.$masonry ||
        !window
      )
        return setTimeout(this.resetMasonry, 500)
      // console.log(!!this.masonryElement)
      if (!this.masonryElement) {
        this.masonryElement = new this.$masonry(
          '#masonrycontainer',
          {
            itemSelector: '.grid-item',
            columnWidth: 1,
            gutter: 0,
            fitWidth: true,
          },
        )
        setTimeout(() => (this.ready = true), 400)
      } else this.masonryElement.layout()
    },
  },
}
</script>

<style lang="scss" scoped>
.bg {
  width: 100vw;
  height: 100vh;
  position: fixed;
  background-image: url('/bg1.png');
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  filter: blur(0.1vw);
  opacity: 0.3;
}

.container {
  position: relative;

  // margin: 2em auto;

  .grid-item {
    margin-bottom: 0px;

    @media (max-width: 768px) {
      width: 100% !important;
    }
  }
}
</style>
