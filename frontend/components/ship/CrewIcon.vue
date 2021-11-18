<template>
  <div
    class="crewmembericon"
    v-if="crewMember"
    v-tooltip="
      hoverable && { type: 'crewMember', ...crewMember }
    "
  >
    <div class="cmielements">
      <div class="cmibg flexcenter">
        <img
          :src="`/images/headerBackgrounds/crew/${
            crewMember.background
              ? crewMember.background.replace(
                  '.jpg',
                  '.webp',
                )
              : 'default.svg'
          }`"
        />
      </div>
      <div class="cmicaptain" v-if="captain">
        <svg viewBox="0 0 14 13">
          <text x="0" y="10">👑</text>
        </svg>
      </div>
      <div class="cmispecies">
        <svg viewBox="0 0 15 15">
          <text x="8" y="12">
            {{
              c.species[crewMember.speciesId]
                ? c.species[crewMember.speciesId].icon
                : '❔'
            }}
          </text>
        </svg>
      </div>
      <img
        v-if="showDiscordIcon && crewMember.discordIcon"
        class="discordicon"
        :src="crewMember.discordIcon"
      />
      <div
        class="cmitagline"
        v-if="showTagline && crewMember.tagline"
      >
        <svg viewBox="0 0 160 15">
          <text x="80" y="12" text-anchor="middle">
            {{ crewMember.tagline }}
          </text>
        </svg>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {
    hoverable: {
      type: Boolean,
      default: true,
    },
    captain: Boolean,
    crewMember: Object,
    showDiscordIcon: { default: true },
    showTagline: { default: false },
  },
  data() {
    return { c }
  },
  computed: {
    ...mapState([]),
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.crewmembericon {
  position: relative;
  width: 100%;
  padding-top: 100%;
  flex-shrink: 0;
}
.cmielements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cmibg {
  position: absolute;
  top: -5%;
  left: -5%;
  width: 110%;
  height: 110%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 1;

  img {
    flex-shrink: 1;
    width: 100%;
    max-width: 100%;
    max-height: 100%;
  }
}

.discordicon {
  position: absolute;
  top: 0;
  right: 4%;
  width: 25%;
  border-radius: 50%;
  z-index: 3;
}
.cmispecies {
  position: absolute;
  z-index: 2;
  width: 70%;
  height: 70%;
  display: flex;
  align-items: center;
  justify-content: center;
  // top: 50%;
  // left: 50%;
  // transform: translateX(-50%) translateY(-50%);
  // font-size: 300%;

  svg {
    width: 100%;

    text {
      transform: translateX(-50%);
      font-size: 1rem;
    }
  }
}
.cmicaptain {
  position: absolute;
  z-index: 3;
  top: 0;
  left: 4%;
  width: 28%;
  height: 28%;

  svg {
    width: 100%;
  }
}

.cmitagline {
  position: absolute;
  z-index: 4;
  width: 100%;
  left: 0%;
  bottom: 0%;

  svg {
    width: 100%;

    text {
      fill: var(--text);
      opacity: 0.8;
      filter: drop-shadow(0 1px 0.3rem #000);
      font-size: 1rem;
    }
  }
}
</style>
