<template>
  <div class="container">
    <div v-if="ship">
      <h1>{{ ship.name }}</h1>
      <button @click="setTarget([0, 0])">0,0</button>
      <button @click="setTarget([1, 1])">1,1</button>

      <br />
      <br />

      <button @click="setRoom('bunk')">bunk</button>
      <button @click="setRoom('cockpit')">
        cockpit
      </button>

      <br />
      <br />

      <div>me: {{ JSON.stringify(crewMember) }}</div>

      <pre>{{ JSON.stringify(ship, null, 2) }}</pre>
    </div>
    <div v-if="!ship">
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
    ...mapState(['ship', 'userId', 'shipIds']),
    crewMember(this: ComponentShape) {
      return this.ship?.crewMembers?.find(
        (cm: CrewMemberStub) => cm.id === this.userId,
      )
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

    setTarget(
      this: ComponentShape,
      target: CoordinatePair,
    ) {
      if (!this.ship) return
      const updates: Partial<ShipStub> = {
        targetLocation: target,
      }
      this.$store.commit('updateShip', updates)
      this.$socket?.emit(
        'ship:targetLocation',
        this.ship.id,
        target,
      )
    },

    setRoom(this: ComponentShape, target: CrewLocation) {
      const updates: Partial<CrewMemberStub> = {
        id: this.userId,
        location: target,
      }
      if (!this.ship) return
      this.$store.commit('updateCrewMember', updates)
      this.$socket?.emit(
        'crew:move',
        this.ship.id,
        this.userId,
        target,
      )
    },
  },
}
</script>

<style></style>
