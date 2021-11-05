<template>
  <Box
    class="contracts"
    v-if="show"
    bgImage="/images/paneBackgrounds/23.webp"
  >
    <template #title
      ><span class="sectionemoji">🎯</span
      >Contracts</template
    >

    <div class="panesection">
      <ShipContract
        v-for="contract in active"
        :key="'ac' + contract.id"
        :contract="contract"
      />
      <ShipContract
        v-for="contract in done"
        :key="'ac' + contract.id"
        :contract="contract"
      />
      <ShipContract
        v-for="contract in stolen"
        :key="'ac' + contract.id"
        :contract="contract"
      />
    </div>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c, selectedShip: null }
  },
  computed: {
    ...mapState(['ship', 'crewMember', 'userId']),
    show(): boolean {
      return (
        this.ship &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('contracts')) &&
        this.ship.contracts.length
      )
    },
    captain(): CrewMemberStub | undefined {
      return this.ship?.crewMembers.find(
        (cm) => cm.id === this.ship?.captain,
      )
    },
    isCaptain(): boolean {
      return this.captain?.id === this.userId
    },
    active(): Contract[] {
      return (this.ship.contracts as Contract[])
        .filter((co) => co.status === 'active')
        .sort(
          (a, b) =>
            c.distance(
              a.lastSeenLocation,
              this.ship.location,
            ) -
            c.distance(
              b.lastSeenLocation,
              this.ship.location,
            ),
        )
    },
    done(): Contract[] {
      return (this.ship.contracts as Contract[]).filter(
        (co) => co.status === 'done',
      )
    },
    stolen(): Contract[] {
      return (this.ship.contracts as Contract[]).filter(
        (co) => co.status === 'stolen',
      )
    },
  },
})
</script>

<style lang="scss" scoped>
.contracts {
  width: 300px;
}
</style>
