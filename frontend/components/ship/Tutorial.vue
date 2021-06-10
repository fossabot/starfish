<template>
  <Box class="tutorial" v-if="show">
    <template #title>
      <span class="sectionemoji">👋</span>Tutorial
    </template>

    <div class="panesection">
      <div v-if="waitingForNextStep">
        ............
      </div>
      <div v-else>
        <div v-html="currentScript.message" />
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
        this.ship && this.tutorial && this.currentScript
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
      c.log('update tutorial')
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
</style>
