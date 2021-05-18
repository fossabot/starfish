<template>
  <Box class="repair">
    <template #title
      ><span class="sectionemoji">🔧</span>Repair
      Bay</template
    >
    <div class="panesection">
      fix 'er up
      <br />
      drag to set repair priority
    </div>
  </Box>
</template>

<script lang="ts">
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return {}
  },
  computed: {
    ...mapState(['ship']),
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.repair {
  position: relative;
  width: 300px;
}
</style>
