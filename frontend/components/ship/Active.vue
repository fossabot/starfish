<template>
  <div
    :key="active.id"
    v-tooltip="{
      type: 'active',
      ...active,
    }"
    class="active"
    :class="{
      pointer: active.usable,
      disabled:
        !active.usable ||
        crewMember.bottomedOutOnStamina ||
        percentCooldownRemaining,
    }"
    @click="use"
  >
    <div
      v-if="active.usable"
      class="cooldownradial"
      :style="{
        background: `conic-gradient(transparent, ${
          360 - percentCooldownRemaining * 360
        }deg, transparent, ${
          360 - Math.min(360, percentCooldownRemaining * 360 + 0.001)
        }deg, rgba(30,30,30,.8))`,
      }"
    ></div>
    <div
      v-else
      class="disabledactive"
      style="background: rgba(30, 30, 30, 0.3)"
    ></div>
    <div
      class="contents"
      :class="{
        fade: crewMember.bottomedOutOnStamina || percentCooldownRemaining,
      }"
    >
      <img :src="`/images/crewActives/${active.id}.svg`" />
    </div>
    <div class="displaytimer" v-if="cooldownRemaining">
      {{ c.msToTimeString(cooldownRemaining, true) }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {
    active: { type: Object, required: true },
  },
  data() {
    return {
      c,
      globalCooldownRemaining: 0,
      cooldownRemaining: 0,
    }
  },
  computed: {
    ...mapState(['userId', 'ship', 'crewMember', 'lastUpdated']),
    data(): CrewActiveData {
      return c.crewActives[this.active.id]
    },
    percentCooldownRemaining(): number {
      // c.log(
      //   'percentCooldownRemaining',
      //   this.cooldownRemaining,
      //   this.data.cooldown,
      //   this.active.unlockLevel,
      // )
      if (!this.active.usable) return 0

      return (
        this.cooldownRemaining /
        Math.max(
          0,
          c.crewActiveBaseGlobalCooldown,
          this.data.cooldown,
          // this.globalCooldownRemaining >=
          //   this.cooldownRemaining
          //   ? c.crewActiveBaseGlobalCooldown
          //   : this.data.cooldown,
        )
      )
    },
  },
  watch: {
    active() {
      this.updateCooldown()
    },
    lastUpdated() {
      this.updateCooldown()
    },
  },
  mounted() {
    this.updateCooldown()
  },
  methods: {
    updateCooldown() {
      if (!this.active.usable) return

      this.globalCooldownRemaining = Math.max(
        0,
        c.crewActiveBaseGlobalCooldown -
          (Date.now() - (this.crewMember?.lastActiveUse || 0)),
      )
      this.cooldownRemaining = Math.max(
        0,
        this.globalCooldownRemaining,
        this.data.cooldown - (Date.now() - this.active.lastUsed),
      )
    },
    use() {
      if (!this.active.usable) return

      if (this.crewMember.bottomedOutOnStamina) {
        this.$store.dispatch('notifications/notify', {
          text: `You need to rest before you can use an ability.`,
          type: 'error',
        })
        return
      }
      if (this.cooldownRemaining > 0) {
        this.$store.dispatch('notifications/notify', {
          text: 'That ability is on cooldown.',
          type: 'error',
        })
        return
      }

      const unchangedActives = [
        ...this.crewMember.actives.map((a) => ({ ...a })),
      ]
      const updatedActives = [...this.crewMember.actives.map((a) => ({ ...a }))]
      const activeInQuestion = updatedActives.find(
        (a) => a.id === this.active.id,
      )
      if (activeInQuestion) activeInQuestion.lastUsed = Date.now()
      this.$store.commit('updateACrewMember', {
        id: this.crewMember.id,
        actives: updatedActives,
      })
      ;(this as any).$socket?.emit(
        'crew:useActive',
        this.ship.id,
        this.crewMember?.id,
        this.active.id,
        (res: IOResponse<true>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            this.$store.commit('updateACrewMember', {
              id: this.crewMember.id,
              actives: unchangedActives,
            })
            c.log(res.error)
            return
          }
          this.$store.dispatch('notifications/notify', {
            text: res.data,
          })
        },
      )
    },
  },
})
</script>

<style lang="scss" scoped>
.active {
  position: relative;
  width: 100%;
  height: 0;
  padding-top: 100%;
  border-radius: 0.8em;
  overflow: hidden;
  box-shadow: 0 0 0 0.4em transparent;

  &:not(.fade) {
    opacity: 0.95;
  }

  &:not(.disabled):hover {
    opacity: 1;
    box-shadow: 0 0 0 0.4em rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.2);
    // transform: scale(1.05);
  }
}

.fade {
  opacity: 0.3;
}
.cooldownradial,
.disabledactive {
  position: absolute;
  top: 0;
  z-index: 3;
  pointer-events: none;
  width: 100%;
  height: 100%;
}
.contents {
  position: absolute;
  top: 0;
  z-index: 2;
  width: 100%;
  height: 100%;

  img {
    width: 100%;
    height: 100%;
  }
}
.displaytimer {
  position: absolute;
  z-index: 4;
  top: 50%;
  left: 50%;
  opacity: 0.8;
  font-weight: bold;
  transform: translate(-50%, -50%);
  text-shadow: 0 0 0.4em black, 0 0 0.2em black;
}
</style>
