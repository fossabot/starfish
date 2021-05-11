<template>
  <div class="container">
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
      if (this.shipIds[index])
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
