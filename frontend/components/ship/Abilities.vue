<template>
    <Box class="abilities" v-if="show" :highlight="highlight" bgImage="/images/paneBackgrounds/23.webp">
      <template #title>
        <span class="sectionemoji">emoji</span>Abilities
      </template>

      <div class="panesection">
        {{crewMember.abilities}}
      </div>
    </Box>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
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
          this.ship.shownPanels.includes('abilities'))
      )
    },
    highlight() {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'abilities'
      )
    },
    
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.abilities {
  width: 200px;
  position: relative;
}
</style>
