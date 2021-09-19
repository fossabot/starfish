<template>
  <div v-if="modal" class="modal flexcenter">
    <div
      class="bg"
      @click="$store.commit('set', { modal: null })"
    ></div>
    <div class="modalbox">
      <ModalTaglineBannerPicker
        v-if="modal === 'headerBackgroundPicker'"
      />

      <portal-target
        v-if="modal === 'prompt'"
        name="prompt"
      />

      <div v-if="modal === 'pause' && $route.path === '/s'">
        Updates Paused
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {},
  data() {
    return { c }
  },
  computed: {
    ...mapState(['modal']),
  },
  watch: {},
  mounted() {
    window.addEventListener('keydown', this.keyListener)
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.keyListener)
  },
  methods: {
    keyListener(e: KeyboardEvent) {
      if (!this.modal) return
      if (e.key === 'Escape')
        this.$store.commit('set', { modal: null })
    },
  },
})
</script>

<style lang="scss" scoped>
.modal {
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 100;
}
.bg {
  background: rgba(30, 30, 30, 0.9);
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 1;
  cursor: pointer;
}

.modalbox {
  box-shadow: 0 5px 20px -5px var(--bg), 0 1px 3px var(--bg);
  max-width: calc(min(900px, 90vw));
  padding: 3em;
  margin: 1.5em;
  z-index: 2;
  position: relative;
  // border: 1px solid var(--pane-border);
  border-radius: 10px;
  background: var(--bg);
  max-height: 90vh;
  overflow-y: auto;
}
</style>
