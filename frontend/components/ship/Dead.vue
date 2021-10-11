<template>
  <Box
    class="dead"
    :minimizable="false"
    bgImage="/images/paneBackgrounds/17.jpg"
  >
    <template #title>You've died!</template>

    <div class="panesection">
      <div class="marbot">
        Your ship explodes into a cloud of rapidly-freezing
        crystals of ice and air! The crew watches in horror
        from the window of the escape pod as the wreckage of
        their ship goes spiraling out into the abyss.
      </div>

      <div class="marbot">
        All of your cargo and most of your credits have been
        jettisoned, and only shreds of your equipment are
        salvageable for scrap, but the crew managed to
        escape back to their homeworld.
      </div>

      <div class="marbot">
        <div v-if="!isCaptain">
          Waiting for captain {{ captain.name }} to respawn.
        </div>
        <div v-if="isCaptain">
          Captain, click to start a new ship.
        </div>
      </div>

      <div
        class="button big"
        v-if="isCaptain"
        @click="$store.dispatch('respawn')"
      >
        <span>Respawn</span>
      </div>
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
      return this.ship && !this.crewMember
    },
    captain(): CrewMemberStub | undefined {
      return this.ship?.crewMembers.find(
        (cm) => cm.id === this.ship?.captain,
      )
    },
    isCaptain(): boolean {
      return this.captain?.id === this.userId
    },
  },
})
</script>

<style lang="scss" scoped>
.dead {
  width: 400px;
}
</style>
