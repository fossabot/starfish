<template>
  <div class="member" v-if="show">
    <Box
      :highlight="highlight"
      bgImage="/images/paneBackgrounds/2.webp"
    >
      <template #title>
        <div class="membertitle">
          <div class="iconholder">
            <ShipCrewIcon
              class="icon"
              :hoverable="false"
              :crewMember="crewMember"
              :showDiscordIcon="false"
            />
          </div>
          <div>{{ crewMember.name }}</div>
        </div>
      </template>

      <div
        class="pointer customizeicon"
        @click="
          $store.commit('set', {
            modal: 'crewTaglineBannerPicker',
          })
        "
      >
        <div class="mainpreview" v-if="!ship.tutorial">
          <ShipCrewIcon
            :crewMember="crewMember"
            :showDiscordIcon="false"
            :hoverable="false"
            :showTagline="true"
          />
        </div>
      </div>

      <div class="panesection">
        <ProgressBar
          :color="'var(--stamina)'"
          :percent="
            crewMember.stamina / crewMember.maxStamina
          "
          v-tooltip="
            `<b>${c.r2(
              crewMember.stamina * 100,
              1,
            )}</b> of <b>${c.r2(
              crewMember.maxStamina * 100,
              1,
            )}</b> max stamina.
            <br />
            Use stamina to perform actions on the ship. You will automatically go to sleep when you run out of stamina.`
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

      <!-- <ShipMemberPassives /> -->
    </Box>
  </div>
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
.membertitle {
  position: relative;
  display: flex;

  .iconholder {
    width: 1em;
    height: 1em;
    margin-right: 0.3em;
    position: relative;
  }
}

.mainpreview {
  backface-visibility: none;
  width: 100%;
  padding: 1em 4em 1em 4em;
}
.customizeicon {
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }
}
</style>
