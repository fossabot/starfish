<template>
  <div class="header">
    <div
      class="bg"
      :style="{
        'background-image': `url('${bg}')`,
      }"
    ></div>
    <div
      class="bgtint2"
      :style="{ 'background-color': color }"
    />
    <div
      class="bgtint"
      :style="{ 'background-color': color }"
    />
    <div class="bgfade"></div>

    <ShipTooltipsGuildBadges :guilds="guilds" />

    <div class="title" :class="{ twocolumn: icon }">
      <div v-if="icon" class="icon">{{ icon }}</div>
      <div>
        <span
          :style="{ color: color }"
          class="tooltipheader"
          >{{ name }}</span
        >
        <div class="sub">
          {{ tagline }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {
    name: {},
    bg: {},
    tagline: {},
    color: {},
    guilds: {},
    icon: {},
    interactive: {},
  },
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
.header {
  position: relative;
  height: 100px;
  width: 100%;
  min-width: 200px;
  overflow: hidden;
  text-shadow: 0 0.2em 0.4em rgba(0, 0, 0, 0.5);

  & > * {
    position: relative;
    z-index: 3;
  }

  .bg,
  .bgtint,
  .bgfade,
  .bgtint2 {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background-size: cover;
    background-position: center;
  }

  .bgtint {
    z-index: 3;
    mix-blend-mode: hue;
    opacity: 0.7;
  }
  .bgtint2 {
    z-index: 3;
    mix-blend-mode: saturation;
    opacity: 1;
  }

  .bgfade {
    z-index: 2;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      var(--bg) 75%
    );
    mix-blend-mode: multiply;
    opacity: 0.8;
  }

  .guildtags {
    position: absolute;
    z-index: 4;
    top: 0;
    right: 0.2em;
    display: flex;
    flex-direction: row-reverse;

    img {
      width: 35px;
      display: block;
      position: relative;
      margin-left: -0.35em;
    }
  }

  .icon {
    font-size: 1.3em;
  }

  .title {
    z-index: 4;
    position: absolute;
    bottom: 0;
    padding: var(--tooltip-pad-tb) var(--tooltip-pad-lr);

    &.twocolumn {
      display: grid;
      grid-template-columns: 1.5em 1fr;
    }
  }
}
</style>
