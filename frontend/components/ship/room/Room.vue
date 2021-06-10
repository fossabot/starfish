<template>
  <div class="room" v-if="show">
    <ShipRoomBunk v-if="crewMember.location === 'bunk'" />
    <ShipRoomCockpit
      v-else-if="crewMember.location === 'cockpit'"
    />
    <ShipRoomRepair
      v-else-if="crewMember.location === 'repair'"
    />
    <ShipRoomWeapons
      v-else-if="crewMember.location === 'weapons'"
    />
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
    ...mapState(['ship', 'crewMember']),
    show(this: ComponentShape) {
      return (
        this.ship &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('room'))
      )
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped></style>
