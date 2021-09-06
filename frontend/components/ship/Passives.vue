<template>
  <div class="passives" v-if="show" :highlight="highlight">
    <Box bgImage="/images/paneBackgrounds/12.jpg">
      <template #title>
        <span class="sectionemoji">💤</span>Ship Passive
        Effects
      </template>

      <div class="panesection">
        <div v-for="p in ship.passives" class="marbotsmall">
          <span class="success">
            {{ c.basePassiveData[p.id].toString(p) }}
          </span>
          <span class="sub nowrap" v-if="p.data.source">
            ({{
              p.data.source.speciesId
                ? `${c.capitalize(
                    p.data.source.speciesId,
                  )} species`
                : p.data.source.planetName
                ? `Planet ${p.data.source.planetName}`
                : p.data.source.item
                ? `${
                    c.items[p.data.source.item.type][
                      p.data.source.item.id
                    ].displayName
                  }`
                : p.data.source
            }})
          </span>
        </div>
      </div>
    </Box>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/src'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c }
  },
  computed: {
    ...mapState(['userId', 'ship', 'crewMember']),
    show() {
      return (
        this.ship &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('passives'))
      )
    },
    highlight() {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'passives'
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.passives {
  width: 270px;
  position: relative;
}
</style>
