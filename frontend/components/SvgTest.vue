<template>
  <svg viewBox="0 0 500 500" v-html="string"></svg>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      ctx: null,
      objects: [],
      string: '',
    }
  },
  computed: {
    ...mapState(['ship']),
  },
  watch: {},
  mounted() {
    requestAnimationFrame(this.frame)
  },
  methods: {
    frame() {
      const newArray = []
      let htmlString = ''
      for (let i = 0; i < 3000; i++) {
        htmlString += `<path d="M ${Math.random() *
          500} ${Math.random() * 500} L ${Math.random() *
          500} ${Math.random() *
          500}" stroke="white" stroke-width="1"></path>`
        // newArray.push([
        //   Math.random() * 500,
        //   Math.random() * 500,
        //   Math.random() * 500,
        //   Math.random() * 500,
        // ])
      }

      this.string = htmlString

      requestAnimationFrame(this.frame)
    },
  },
}
</script>

<style lang="scss">
svg {
  width: 500px;
  height: 500px;
}
</style>
