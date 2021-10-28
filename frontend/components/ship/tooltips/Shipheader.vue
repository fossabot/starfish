<template>
  <div
    class="topzone pointer"
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
          data.headerBackground || 'default.webp'
        }')`,
      }"
    ></div>
    <div class="bgfade"></div>
    <div class="content">
      <div class="">
        <div class="tooltipheader">{{ data.name }}</div>
        <div v-if="data.tagline" class="sub">
          {{ data.tagline }}
        </div>
      </div>
    </div>
    <img
      v-if="data.guildId && c.guilds[data.guildId]"
      class="guildtag"
      :src="`/images/guildBadges/badge-${data.guildId}.webp`"
      v-tooltip="
        `<b>Guild:</b> ${c.guilds[data.guildId].name}`
      "
    />
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
  position: relative;
  overflow: hidden;
  text-shadow: 0 0.2em 0.4em rgba(0, 0, 0, 0.3);

  &.captain {
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
    background-size: cover !important;
    background-position: center center !important;
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

  .guildtag {
    display: block;
    position: absolute;
    z-index: 3;
    top: 0;
    right: 0.2em;
    width: 35px;
  }
}
</style>
