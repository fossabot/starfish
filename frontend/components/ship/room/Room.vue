<template>
  <div class="room">
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
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped></style>
