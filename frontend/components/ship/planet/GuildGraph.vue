<template>
  <div
    class="flex guildgraph rounded"
    v-if="planet && planet.allegiances"
  >
    <div
      class="singleholder flexcenter"
      v-if="planet.allegiances.length"
      v-for="a in [...planet.allegiances]
        .filter((a) => a.level >= 1)
        .sort((a, b) => b.level - a.level)"
      :key="'fal' + c.guilds[a.guildId]"
      :style="{
        'flex-grow': a.level,
      }"
      v-tooltip="c.guilds[a.guildId].name"
    >
      <div
        class="single"
        :style="{
          background: c.guilds[a.guildId].color,
          height: 0.05 + (a.level / 100) * 0.95 + 'em',
        }"
      ></div>
    </div>
    <div class="sub" v-if="!planet.allegiances.length">
      No guild allegiances.
    </div>
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
