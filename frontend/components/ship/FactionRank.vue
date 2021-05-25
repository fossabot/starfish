<template>
  <Box class="factionrank" v-if="ship">
    <template #title>
      <span class="sectionemoji">🏆</span>Faction Rankings
    </template>

    <div class="panesection"></div>
  </Box>
</template>

<script lang="ts">
import c from '../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return { c }
  },
  computed: {
    ...mapState(['userId', 'ship', 'crewMember']),
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.factionrank {
  width: 260px;
  position: relative;
}
</style>
