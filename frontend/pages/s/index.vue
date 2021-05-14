<template>
  <div>
    <div class="container" v-if="ship && crewMember">
      <Ship />

      <ShipMap />
      <ShipVisible />

      <ShipPlanet v-if="ship.planet" />

      <ShipMember />
      <ShipRoom />

      <!-- <CanvasTest /> -->
      <!-- <SvgTest /> -->
      <!-- <FabricTest /> -->
      <!-- <CanvasObject /> -->

      <br />
      <br />

      <pre>{{ JSON.stringify(ship, null, 2) }}</pre>
    </div>
    <div class="box" v-if="!ship || !crewMember">
      No ship found by the ID(s) you have saved! Try logging
      out and back in. If that doesn't fix it, please reach
      out on the support server.
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
  },

  mounted(this: ComponentShape) {
    if (!this.userId) {
      this.$router.push('/login')
      return
    }
    this.changeShip(this.currentShipIndex)
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
  },
}
</script>

<style lang="scss" scoped></style>
