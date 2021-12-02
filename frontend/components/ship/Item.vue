<template>
  <div
    class="item"
    :class="{
      highlight: tooltip && tooltip.id === item.id,
    }"
    v-tooltip="{
      type: 'item',
      id: item.id,
      owner: owner,
    }"
    v-targetpoint="
      item.itemType === 'weapon' && owner
        ? {
            color: '#ff5a5c',
            type: 'item',
            itemType: 'weapon',
            location: owner.location,
            radius: item.range * item.repair,
          }
        : null
    "
  >
    <div class="labels">
      {{ item.displayName }}
      <span
        v-if="
          item.level && item.maxLevel && item.maxLevel > 1
        "
        class="level"
        :class="{ max: item.level === item.maxLevel }"
        >{{ item.level }}</span
      >
      <span class="sub">{{
        c.capitalize(item.itemType)
      }}</span>
    </div>
    <div class="hpbar">
      <HealthBar
        :max="item.maxHp"
        :percent="item.repair"
        :color="`var(--${item.itemType})`"
        :style="{ height: `${item.maxHp / 5}em` }"
      />
    </div>
    <ProgressBar
      v-if="item.itemType === 'weapon'"
      :micro="true"
      :percent="
        (item.chargeRequired - item.cooldownRemaining) /
        item.chargeRequired
      "
      :dangerZone="-1"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: { item: Object, owner: Object },
  data() {
    return { c }
  },
  computed: {
    ...mapState(['tooltip']),
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.item:not(:last-of-type) {
  margin-bottom: 1.1em;
}
.highlight {
  position: relative;
  z-index: 2;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 0.5em rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.labels {
  line-height: 0.9;
}

.hpbar {
  margin-top: 0.2em;
}

.level {
  position: relative;
  display: inline-block;
  height: 1.3em;
  top: -0.3em;
  background: var(--gray);
  // color: var(--bg);
  font-weight: bold;
  text-shadow: 0 0 0.2em var(--bg);
  font-size: 0.6em;
  line-height: 1;
  padding: 0.3em 0.4em 0em 0.4em;
  border-radius: 1em;
  // margin: 0 0.4em;

  &.max {
    background: var(--success);
  }
}
</style>
