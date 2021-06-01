<template>
  <Box class="bunk">
    <template #title
      ><span class="sectionemoji">🛌</span>Bunk</template
    >
    <div class="panesection">zzzzZZZZzzzz.....</div>
    <div class="panesection" v-if="timeToRested">
      Fully rested in {{ timeToRested }}
    </div>
    <div
      class="panesection"
      v-if="crewMember.stamina === 1"
    >
      Fully rested!
    </div>
  </Box>
</template>

<script lang="ts">
import c from '../../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return { c }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
    timeToRested(this: ComponentShape) {
      if (this.crewMember.stamina === 1) return null
      return c.msToTimeString(
        ((this.crewMember.maxStamina -
          this.crewMember.stamina) /
          c.getStaminaGainPerTickForSingleCrewMember()) *
          c.TICK_INTERVAL,
      )
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.bunk {
  position: relative;
  width: 270px;
}
</style>
