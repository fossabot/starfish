<template>
  <div
    class="item"
    v-tooltip="{
      type: 'item',
      itemType: item.itemType,
      itemId: item.itemId,
      ownerId: owner.id,
    }"
    v-targetpoint="
      item.itemType === 'weapon' && owner
        ? {
            color: '#ff7733',
            type: 'item',
            itemType: 'weapon',
            location: owner.location,
            radius: item.range * item.repair,
          }
        : null
    "
  >
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
    <div class="hpbar">
      <PillBar
        :mini="true"
        :value="item.repair * item.maxHp"
        :max="item.maxHp"
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
  computed: {},
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
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
