<template>
  <Box
    class="bunk"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/13.jpg"
  >
    <template #title
      ><span class="sectionemoji">🛌</span>Bunk</template
    >
    <div class="panesection">zzzzZZZZzzzz.....</div>
    <div class="panesection" v-if="timeToRested">
      Fully rested in {{ timeToRested }}
    </div>
    <div
      class="panesection"
      v-if="crewMember.stamina === 1"
    >
      Fully rested!
    </div>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
    highlight() {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'room'
      )
    },
    timeToRested() {
      if (this.crewMember.stamina === 1) return null
      return c.msToTimeString(
        ((this.crewMember.maxStamina -
          this.crewMember.stamina) /
          c.getStaminaGainPerTickForSingleCrewMember(
            this.ship.gameSettings.baseStaminaUse,
          )) *
          c.tickInterval,
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.bunk {
  position: relative;
  width: 320px;
}
</style>
