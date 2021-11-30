<template>
  <div
    :key="active.id"
    v-tooltip="{
      type: 'active',
      ...active,
    }"
    class="active pointer"
    :class="{
      disabled: cooldownRemaining,
      fade: cooldownRemaining,
    }"
    @click="use"
  >
    <div
      class="cooldownradial"
      :style="{
        background: `conic-gradient(transparent, ${
          360 - percentCooldownRemaining * 360
        }deg, transparent, ${
          360 -
          Math.min(
            360,
            percentCooldownRemaining * 360 + 0.001,
          )
        }deg, rgba(30,30,30,.8))`,
      }"
    ></div>
    <div class="contents">
      <img :src="`/images/crewActives/${active.id}.svg`" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: { active: { type: Object, required: true } },
  data() {
    return { c, cooldownRemaining: 0 }
  },
  computed: {
    ...mapState(['userId', 'ship', 'crewMember']),
    data(): CrewActiveData {
      return c.crewActives[this.active.id]
    },
    percentCooldownRemaining(): number {
      return (
        this.cooldownRemaining /
        Math.max(
          0,
          c.crewActiveBaseGlobalCooldown,
          this.data.cooldown,
        )
      )
    },
  },
  watch: {
    active() {
      this.updateCooldown()
    },
  },
  mounted() {
    this.updateCooldown()
  },
  methods: {
    updateCooldown() {
      this.cooldownRemaining = Math.max(
        0,
        c.crewActiveBaseGlobalCooldown -
          (Date.now() -
            (this.crewMember?.lastActiveUse || 0)),
        this.data.cooldown -
          (Date.now() - this.active.lastUsed),
      )
      if (this.cooldownRemaining > 0) {
        setTimeout(this.updateCooldown, 1000)
      }
    },
    use() {
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
      const updatedActives = [
        ...this.crewMember.actives.map((a) => ({ ...a })),
      ]
      const activeInQuestion = updatedActives.find(
        (a) => a.id === this.active.id,
      )
      if (activeInQuestion)
        activeInQuestion.lastUsed = Date.now()
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
.cooldownradial {
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
</style>
