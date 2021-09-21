<template>
  <Box class="tutorial" v-if="show" :highlight="highlight">
    <template #title>
      <span class="sectionemoji">👋</span>Tutorial
    </template>

    <div class="panesection">
      <div
        :class="{ invisible: waitingForNextStep }"
        class="spreader"
      >
        <div class="flex maintextholder">
          <div
            class="maintext"
            v-html="currentScript.message"
          />
        </div>
        <div class="padtop flexbetween">
          <button
            v-if="
              currentScript.advance && !waitingForNextStep
            "
            @click="advanceTutorial"
          >
            {{ currentScript.advance }}
          </button>
          <button
            v-else-if="
              textToShow &&
              scriptIndex < textToShow.length - 1
            "
            @click="scriptIndex++"
          >
            {{ currentScript.next || 'Go on...' }}
          </button>
          <div v-else></div>
          <button class="secondary" @click="skipTutorial">
            Skip Tutorial
          </button>
        </div>
      </div>
    </div>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c, scriptIndex: 0, waitingForNextStep: false }
  },
  computed: {
    ...mapState(['userId', 'ship', 'crewMember']),
    show(): boolean {
      return (
        this.ship &&
        this.crewMember &&
        this.tutorial &&
        this.currentScript
      )
    },
    highlight(): boolean {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'tutorial'
      )
    },
    tutorial(): any {
      return this.ship && this.ship.tutorial
    },
    textToShow(): string[] {
      return this.tutorial?.currentStep?.script?.filter(
        (s: any) => !s.channel,
      )
    },
    currentScript(): string {
      return this.textToShow?.[this.scriptIndex]
    },
  },
  watch: {
    tutorial(newT: any, oldT: any) {
      this.scriptIndex = 0
      this.waitingForNextStep = false
    },
  },
  mounted() {},
  methods: {
    advanceTutorial() {
      this.waitingForNextStep = true
      ;(this as any).$socket.emit(
        'ship:advanceTutorial',
        this.ship.id,
      )
    },
    skipTutorial() {
      ;(this as any).$socket.emit(
        'ship:skipTutorial',
        this.ship.id,
      )
    },
  },
})
</script>

<style lang="scss" scoped>
.tutorial {
  width: 380px;
  position: relative;
}
.spreader {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.maintextholder {
  align-items: center;
  flex-grow: 1;
}
</style>
