<template>
  <div>
    <div
      class="guildgraph"
      v-if="
        planet &&
        planet.allegiances &&
        planet.allegiances.length
      "
    >
      <div
        class="allyline"
        :style="{
          left: `${c.guildAllegianceFriendCutoff}%`,
        }"
      ></div>
      <div
        class="bar"
        v-if="planet.allegiances.length"
        v-for="a in [...planet.allegiances]
          .filter((a) => a.level > 0)
          .sort((a, b) => b.level - a.level)"
        :key="'fal' + a.guildId"
        v-tooltip="
          `${c.guilds[a.guildId].name}: ${c.r2(
            a.level,
            0,
          )}%`
        "
      >
        <div
          class="fill"
          :class="{
            notyet: a.level < c.guildAllegianceFriendCutoff,
          }"
          :style="{
            width: `${a.level}%`,
            background: c.guilds[a.guildId].color,
          }"
        ></div>
      </div>
    </div>
    <div class="sub" v-else>No guild allegiances.</div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {
    planet: {
      type: Object as PropType<PlanetStub | undefined>,
    },
  },
  data() {
    return { c }
  },
  computed: {},
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.guildgraph {
  position: relative;
  width: 100%;
  margin-top: 1.4em;

  .allyline {
    width: 2px;
    height: 100%;
    position: absolute;
    z-index: 4;
    background: rgba(255, 255, 255, 0.4);

    &:after {
      content: 'ALLY';
      position: absolute;
      bottom: 105%;
      font-size: 0.75em;
      font-weight: bold;
      color: var(--text);
      transform: translateX(-50%);
      opacity: 0.6;
    }
  }

  .bar {
    position: relative;
    height: 0.7em;
    border-radius: 0.35em;
    padding-top: 0.1em;
    padding-bottom: 0.1em;
    background: rgba(255, 255, 255, 0.05);

    .fill {
      height: 100%;
      border-radius: 0.35em;

      &.notyet {
        opacity: 0.7;
      }
    }
  }
}
</style>
