<template>
  <Box class="bunk">
    <template #title
      ><span class="sectionemoji">🛌</span>Bunk</template
    >
    <div class="panesection">zzzzzzzz.....</div>
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
.bunk {
  position: relative;
  width: 300px;
}
</style>
