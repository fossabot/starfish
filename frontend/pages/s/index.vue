<template>
  <div>
    <Starfield />
    <div
      id="masonrycontainer"
      class="container"
      ref="container"
      v-if="ship && crewMember && !ship.dead"
    >
      <Ship class="grid-item" />

      <ShipMapPlayermap class="grid-item" />
      <ShipVisible class="grid-item" />

      <ShipPlanet v-if="ship.planet" class="grid-item" />

      <ShipMember class="grid-item" />
      <ShipDiagram class="grid-item" />
      <ShipRoom class="grid-item" />

      <ShipItems class="grid-item" />
      <ShipCrewRank class="grid-item" />
    </div>
    <div class="box" v-if="ship && ship.dead">
      <h5>U dead</h5>
    </div>

    <pre v-if="ship">{{
      JSON.stringify(ship, null, 2)
    }}</pre>

    <div class="box" v-if="!ship || !crewMember">
      No ship found by the ID(s) you have saved! If you're
      sure that your server still has a ship in the game,
      try logging out and back in. If that doesn't fix it,
      please reach out on the support server.
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return {
      currentShipIndex: 0,
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
    ship() {
      this.resetMasonry()
    },
    planet() {
      this.resetMasonry()
    },
    room() {
      this.resetMasonry()
    },
  },

  mounted(this: ComponentShape) {
    if (!this.userId) {
      this.$router.push('/login')
      return
    }
    this.changeShip(this.currentShipIndex)
    this.$nextTick(this.resetMasonry)
  },

  methods: {
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
      await this.$nextTick()
      if (
        !this.$refs.container ||
        !this.$masonry ||
        !window
      )
        return setTimeout(this.resetMasonry, 500)
      new this.$masonry('#masonrycontainer', {
        itemSelector: '.grid-item',
        columnWidth: 1,
        gutter: 0,
        fitWidth: true,
      })

      setTimeout(
        () =>
          new this.$masonry('#masonrycontainer', {
            itemSelector: '.grid-item',
            columnWidth: 1,
            gutter: 0,
            fitWidth: true,
          }),
        500,
      )

      setTimeout(
        () =>
          new this.$masonry('#masonrycontainer', {
            itemSelector: '.grid-item',
            columnWidth: 1,
            gutter: 0,
            fitWidth: true,
          }),
        1000,
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  margin: 2em auto;

  .grid-item {
    margin-bottom: 0px;
  }
}
</style>
