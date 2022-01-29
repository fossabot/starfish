<template>
  <div class="container masonrycontainer" ref="container">
    <Box
      style="width: 550px"
      :minimizable="false"
      bgImage="/images/paneBackgrounds/21.webp"
    >
      <template #title> <span class="sectionemoji"></span>D </template>

      <div class="panesection textcolumn">done</div>
    </Box>
  </div>
</template>

<script>
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'
import FreeMase from '../../assets/scripts/freemase'

export default Vue.extend({
  head() {
    return {}
  },
  data() {
    return { c }
  },
  computed: {
    ...mapState(['userId']),
  },
  watch: {},
  mounted() {
    new FreeMase(this.$refs.container, {
      centerX: true,
    })
  },
  methods: {},
})
</script>

<style lang="scss" scoped>
.container {
  max-width: 1000px;
}
</style>
