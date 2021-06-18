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
        <div class="padtop">
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
        </div>
      </div>
    </div>
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
    return { c, scriptIndex: 0, waitingForNextStep: false }
  },
  computed: {
    ...mapState(['userId', 'ship', 'crewMember']),
    show(this: ComponentShape) {
      return (
        this.ship &&
        this.crewMember &&
        this.tutorial &&
        this.currentScript
      )
    },
    highlight(this: ComponentShape) {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'tutorial'
      )
    },
    tutorial(this: ComponentShape) {
      return this.ship && this.ship.tutorial
    },
    textToShow(this: ComponentShape) {
      return this.tutorial?.currentStep?.script?.filter(
        (s: any) => !s.channel,
      )
    },
    currentScript(this: ComponentShape) {
      return this.textToShow?.[this.scriptIndex]
    },
  },
  watch: {
    tutorial(newT: any, oldT: any) {
      this.scriptIndex = 0
      this.waitingForNextStep = false
    },
  },
  mounted(this: ComponentShape) {},
  methods: {
    advanceTutorial(this: ComponentShape) {
      this.waitingForNextStep = true
      this.$socket.emit(
        'ship:advanceTutorial',
        this.ship.id,
      )
    },
  },
}
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
