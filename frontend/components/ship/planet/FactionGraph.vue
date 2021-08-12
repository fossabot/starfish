<template>
  <div
    class="flex factiongraph rounded"
    v-if="planet && planet.allegiances"
  >
    <div
      class="singleholder flexcenter"
      v-if="planet.allegiances.length"
      v-for="a in [...planet.allegiances].sort(
        (a, b) => b.level - a.level,
      )"
      :key="'fal' + a.faction.id"
      :style="{
        'flex-grow': a.level,
      }"
      v-tooltip="a.faction.name"
    >
      <div
        class="single"
        :style="{
          background: a.faction.color,
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
import c from '../../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  props: { planet: {} },
  data(): Partial<ComponentShape> {
    return { c }
  },
  computed: {},
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
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
