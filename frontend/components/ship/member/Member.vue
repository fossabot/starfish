<template>
  <div class="member" v-if="show">
    <Box
      :highlight="highlight"
      bgImage="/images/paneBackgrounds/2.jpg"
    >
      <template #title>
        <span class="sectionemoji">{{
          c.species[ship.species.id].icon
        }}</span
        >{{ crewMember.name }}
      </template>

      <div class="panesection">
        <ProgressBar
          :color="'var(--stamina)'"
          :percent="
            crewMember.stamina / crewMember.maxStamina
          "
          v-tooltip="
            'Use stamina to perform actions on the ship. You will automatically go to sleep when you run out of stamina.'
          "
        >
          <div>
            Stamina:
            <NumberChangeHighlighter
              :number="
                c.r2(
                  (crewMember.stamina /
                    crewMember.maxStamina) *
                    100,
                  1,
                )
              "
              :display="
                c.r2(
                  (crewMember.stamina /
                    crewMember.maxStamina) *
                    100,
                  1,
                ) + '%'
              "
            />
          </div>
        </ProgressBar>
      </div>

      <!-- <ShipMemberInventory /> -->

      <ShipMemberSkills />

      <ShipMemberPassives />
    </Box>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../common/src'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
    show() {
      return (
        this.ship &&
        this.crewMember &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('crewMember'))
      )
    },
    highlight() {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'crewMember'
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.member {
  position: relative;
  grid-column: span 2;
  width: 250px;
}
.box {
  width: 100%;
}
</style>
