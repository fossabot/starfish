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
    <ShipRoomMine
      v-else-if="crewMember.location === 'mine'"
    />
    <ShipRoomLab
      v-else-if="crewMember.location === 'lab'"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return {}
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
    show() {
      return (
        this.ship &&
        this.crewMember &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('room'))
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped></style>
