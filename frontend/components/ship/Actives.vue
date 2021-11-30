<template>
  <Box
    class="abilities"
    v-if="show"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/25.webp"
  >
    <template #title>
      <span class="sectionemoji">▶️</span>Abilities
    </template>
    <div class="panesection grid3 activelist">
      <ShipActive
        v-for="a in crewMember.actives"
        :key="a.id"
        :active="a"
      />
    </div>
    <div
      class="panesection"
      v-if="crewMember.actives.length > 1"
    >
      <div class="sub" v-if="!globalCooldownRemaining">
        Global ability cooldown:
        {{
          c.msToTimeString(c.crewActiveBaseGlobalCooldown)
        }}
      </div>
      <div v-else class="sub">
        Global cooldown remaining:
        <div>
          {{ c.msToTimeString(globalCooldownRemaining) }} /
          {{
            c.msToTimeString(c.crewActiveBaseGlobalCooldown)
          }}
        </div>
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
    let updateCooldownTimer: any
    return {
      c,
      globalCooldownRemaining: 0,
      updateCooldownTimer,
    }
  },
  computed: {
    ...mapState(['userId', 'ship', 'crewMember']),
    show(): boolean {
      return (
        this.ship &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('actives'))
      )
    },
    highlight(): boolean {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'actives'
      )
    },
    lastActiveUse(): number {
      return this.crewMember?.lastActiveUse || 0
    },
  },
  watch: {
    lastActiveUse() {
      this.updateCooldown()
    },
  },
  mounted() {
    this.updateCooldown()
  },
  methods: {
    updateCooldown(): void {
      this.globalCooldownRemaining = Math.max(
        0,
        c.crewActiveBaseGlobalCooldown -
          (Date.now() -
            (this.crewMember?.lastActiveUse || 0)),
      )
      if (this.updateCooldownTimer)
        clearTimeout(this.updateCooldownTimer)
      if (this.globalCooldownRemaining > 0)
        this.updateCooldownTimer = setTimeout(
          this.updateCooldown,
          1000,
        )
    },
  },
})
</script>

<style lang="scss" scoped>
.abilities {
  width: 220px;
  position: relative;
}
.activelist {
  grid-gap: 1em;
}
</style>
