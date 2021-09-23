<template>
  <div
    class="flex factiongraph rounded"
    v-if="planet && planet.allegiances"
  >
    <div
      class="singleholder flexcenter"
      v-if="planet.allegiances.length"
      v-for="a in [...planet.allegiances]
        .filter((a) => a.level >= 1)
        .sort((a, b) => b.level - a.level)"
      :key="'fal' + c.factions[a.faction.id]"
      :style="{
        'flex-grow': a.level,
      }"
      v-tooltip="c.factions[a.faction.id].name"
    >
      <div
        class="single"
        :style="{
          background: c.factions[a.faction.id].color,
          height: 0.05 + (a.level / 100) * 0.95 + 'em',
        }"
      ></div>
    </div>
    <div class="sub" v-if="!planet.allegiances.length">
      No faction allegiances.
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: { planet: {} },
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
.factiongraph {
  .singleholder {
    position: relative;
    min-width: 1em;
    height: 1em;
    padding-right: 1px solid transparent;

    .single {
      width: 100%;
    }
  }
}
</style>
