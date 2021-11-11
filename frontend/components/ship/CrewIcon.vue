<template>
  <div
    class="crewmember"
    v-if="crewMember"
    v-tooltip="{ type: 'crewMember', ...crewMember }"
  >
    <div class="elements">
      <div class="bg"></div>
      <div class="captain" v-if="captain">
        <svg viewBox="0 0 14 13">
          <text x="0" y="10">👑</text>
        </svg>
      </div>
      <div
        class="species"
        v-if="
          crewMember.speciesId &&
          c.species[crewMember.speciesId]
        "
      >
        <svg viewBox="0 0 15 15">
          <text x="1.15" y="12">
            {{ c.species[crewMember.speciesId].icon }}
          </text>
        </svg>
      </div>
      <img
        v-if="showDiscordIcon && crewMember.discordIcon"
        class="icon"
        :src="crewMember.discordIcon"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {
    captain: Boolean,
    crewMember: Object,
    showDiscordIcon: { default: true },
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
.crewmember {
  position: relative;
  width: 100%;
  padding-top: 100%;
}
.elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg {
  position: relative;
  width: 50%;
  height: 50%;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  z-index: 1;
}

.icon {
  position: absolute;
  z-index: 3;
  top: 0;
  right: 0;
  width: 25%;
  height: 25%;
  border-radius: 50%;
}
.species {
  position: absolute;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  // top: 50%;
  // left: 50%;
  // transform: translateX(-50%) translateY(-50%);
  // font-size: 300%;

  svg {
    width: 100%;
  }
}
.captain {
  position: absolute;
  z-index: 3;
  top: 0;
  left: 0;
  width: 28%;
  height: 28%;

  svg {
    width: 100%;
  }
}
</style>
