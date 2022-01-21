<template>
  <Box
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/2.webp"
    class="member"
    v-if="show"
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
      <div class="" style="grid-gap: 0.3em">
        <ProgressBar
          class="marbotsmall"
          :color="'var(--stamina)'"
          :max="crewMember.maxStamina"
          :percent="crewMember.stamina / crewMember.maxStamina"
          v-tooltip="
            `<b>${c.r2(crewMember.stamina * 100, 1)}</b> of <b>${c.r2(
              crewMember.maxStamina * 100,
              1,
            )}</b> max stamina.
            <br />
            Use stamina to perform actions on the ship. You will automatically go to sleep when you run out of stamina.`
          "
        >
          <div class="fullwidth flexbetween padtoptiny padbottiny">
            <div>Stamina</div>
            <NumberChangeHighlighter
              :raw="crewMember.stamina / crewMember.maxStamina"
              :number="
                c.r2((crewMember.stamina / crewMember.maxStamina) * 100, 1)
              "
              :display="
                c.r2((crewMember.stamina / crewMember.maxStamina) * 100, 1) +
                '%'
              "
              :arrow="true"
            />
          </div>
        </ProgressBar>
        <ProgressBar
          :color="
            crewMember.morale > ship.gameSettings.moraleHighThreshold
              ? 'var(--success)'
              : 'rgba(255,255,255,0.7)'
          "
          :percent="crewMember.morale || 0"
          :dangerZone="ship.gameSettings.moraleLowThreshold"
          v-tooltip="
            `At <b>${
              ship.gameSettings.moraleHighThreshold * 100
            }%</b> morale or above, you will find yourself more capable than otherwise.<br />
            At <b>${
              ship.gameSettings.moraleLowThreshold * 100
            }%</b> morale or below, you will find yourself face to face with space madness.
            <br /><br />
            Morale is gained and lost through most actions on the ship.`
          "
        >
          <div
            class="moraleoverlay"
            :style="{
              left: ship.gameSettings.moraleHighThreshold * 100 + '%',
              width: '100%',
              'border-left': '1px solid var(--success)',
            }"
          >
            <div
              class="moraleoverlaybg"
              :style="{
                background: 'var(--success)',
              }"
            ></div>
          </div>
          <div
            class="moraleoverlay"
            :style="{
              opacity: 0.7,
              left: 0,
              width: ship.gameSettings.moraleLowThreshold * 100 + '%',
              'border-right': '1px solid var(--warning)',
            }"
          >
            <div
              class="moraleoverlaybg"
              :style="{
                background: 'var(--warning)',
              }"
            ></div>
          </div>
          <div
            class="fullwidth flexbetween padtoptiny padbottiny"
            style="position: relative"
          >
            <div>Morale</div>
            <NumberChangeHighlighter
              :raw="crewMember.morale || 0"
              :number="c.r2((crewMember.morale || 0) * 100, 1)"
              :display="c.r2((crewMember.morale || 0) * 100, 1) + '%'"
              :arrow="true"
            />
          </div>
        </ProgressBar>
      </div>
    </div>

    <!-- <ShipMemberInventory /> -->

    <ShipMemberSkills />

    <!-- <ShipMemberPassives /> -->
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
    show() {
      return (
        this.ship &&
        this.crewMember &&
        (!this.ship.shownPanels || this.ship.shownPanels.includes('crewMember'))
      )
    },
    highlight() {
      return this.ship?.tutorial?.currentStep?.highlightPanel === 'crewMember'
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
  padding: 0.2em 4em 0em 4em;
}
.customizeicon {
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }
}

.moraleoverlay {
  opacity: 0.3;
  mix-blend-mode: multiply;
  position: absolute;
  top: 0;
  height: 100%;

  .moraleoverlaybg {
    opacity: 0.3;
    position: absolute;
    height: 100%;
    width: 100%;
  }
}
</style>
