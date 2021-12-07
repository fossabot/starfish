<template>
  <div class="container">
    <div class="textcolumn">
      <h1>Patch Notes</h1>

      <template v-for="update in updates">
        <article :key="update.slug">
          <div class="sub">
            {{
              new Date(update.createdAt).toLocaleString()
            }}
          </div>
          <nuxt-content :document="update" />
        </article>
        <hr />
      </template>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import c from '../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  async asyncData({ $content }) {
    const updates = await $content('patchnotes')
      .sortBy('createdAt', 'desc')
      .fetch()
    return {
      updates,
    }
  },
  data() {
    return { c }
  },
  computed: {
    ...mapState([]),
  },
  watch: {},
  async mounted() {
    c.log(this.updates)
  },
  methods: {},
})
</script>

<style lang="scss" scoped>
article {
  margin-top: 2em;
}
</style>
