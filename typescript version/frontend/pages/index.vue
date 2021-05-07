<template>
  <div class="container">
    <button @click="setTarget([0, 0])">0,0</button>
    <button @click="setTarget([1, 1])">1,1</button>

    <br />
    <br />

    <button @click="setRoom('cm1', 'bunk')">bunk</button>
    <button @click="setRoom('cm1', 'cockpit')">
      cockpit
    </button>

    <br />
    <br />

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
    return {}
  },
  computed: {
    ...mapState(['ship']),
  },
  mounted(this: ComponentShape) {},
  methods: {
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

    setRoom(
      this: ComponentShape,
      crewId: string,
      target: CrewLocation,
    ) {
      const updates: Partial<CrewMemberStub> = {
        id: crewId,
        location: target,
      }
      this.$store.commit('updateCrewMember', updates)
      this.$socket?.emit(
        'crew:move',
        this.ship.id,
        crewId,
        target,
      )
    },
  },
}
</script>

<style></style>
