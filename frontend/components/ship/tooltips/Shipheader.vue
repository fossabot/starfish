<template>
  <div
    class="topzone"
    :class="{ captain: isCaptain }"
    @click="
      isCaptain &&
        $store.commit('set', {
          modal: 'headerBackgroundPicker',
        })
    "
  >
    <div
      class="bg"
      :style="{
        background: `url('/images/headerBackgrounds/${
          data.headerBackground || 'default.jpg'
        }')`,
      }"
    ></div>
    <div class="bgfade"></div>
    <div class="content">
      <div
        v-if="
          data.species &&
          data.species.id &&
          c.species[data.species.id]
        "
      >
        <div
          class="icon"
          :class="{ pushup: data.tagline }"
          v-tooltip="{
            type: 'species',
            data: c.species[data.species.id],
          }"
        >
          {{ c.species[data.species.id].icon }}
        </div>
      </div>
      <div class="right">
        <div class="tooltipheader">{{ data.name }}</div>
        <div v-if="data.tagline" class="sub">
          {{ data.tagline }}
        </div>
      </div>
    </div>
    <div
      v-if="
        data.faction &&
        data.faction.id &&
        c.factions[data.faction.id]
      "
      class="factiontag"
      :style="{
        background: c.factions[data.faction.id].color,
      }"
      v-tooltip="
        `<b>Faction:</b> ${
          c.factions[data.faction.id].name
        }`
      "
    ></div>
  </div>
</template>

<script>
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: { data: {}, interactive: {} },
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship', 'userId']),
    isCaptain() {
      return (
        this.interactive &&
        this.ship?.id === this.data?.id &&
        this.ship?.captain &&
        this.ship?.captain === this.userId
      )
    },
  },
  mounted() {},
})
</script>

<style scoped lang="scss">
.topzone {
  width: 100%;
  min-width: 200px;
  background-size: cover !important;
  background-position: center center !important;
  position: relative;
  overflow: hidden;
  text-shadow: 0 0.2em 0.4em rgba(0, 0, 0, 0.3);

  &.captain {
    cursor: var(--cursor-pointer);

    &:hover {
      .bg {
        transform: scale(1.05);
      }
    }
  }

  .bg {
    width: 100%;
    height: 100%;
    position: absolute;
    transition: all 0.2s ease-in-out;
  }

  .bgfade {
    width: 100%;
    height: 100%;
    position: absolute;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      var(--bg) 85%
    );
    mix-blend-mode: multiply;
    opacity: 0.5;
  }

  .content {
    height: 100%;
    display: flex;
    align-items: flex-end;
    padding: 0.7em 1em;
    position: relative;
    z-index: 1;

    min-height: 100px;
  }

  .icon {
    position: relative;
    font-size: 1.4em;
    top: 0.1em;

    &.pushup {
      top: -0.7em;
    }
  }

  .right {
    flex-grow: 1;
    padding-left: 0.5em;
  }

  .factiontag {
    position: absolute;
    z-index: 3;
    top: 0;
    right: 0;
    width: 60px;
    height: 60px;
    transform: translateX(50%) translateY(-50%)
      rotate(45deg);
    box-shadow: 0 0 10px -3px var(--bg);
  }
}
</style>
