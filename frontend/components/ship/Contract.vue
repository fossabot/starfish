<template>
  <div
    class="contract flexcolumn"
    :class="{
      stolen: contract.status === 'stolen',
      done: contract.status === 'done',
    }"
  >
    <div class="marbotsmall">
      <span
        class="name bold"
        :style="{
          color: contract.targetGuildId
            ? c.guilds[contract.targetGuildId].color
            : '',
        }"
      >
        <!-- v-tooltip="{
        type: 'ship',
        id: contract.targetId,
      }" -->
        {{ contract.targetName }}
      </span>
      <span class="difficulty sub">
        ({{
          contract.difficulty < 5
            ? 'Easy'
            : contract.difficulty < 10
            ? 'Medium'
            : contract.difficulty < 20
            ? 'Hard'
            : contract.difficulty < 40
            ? 'Murderous'
            : 'Insane'
        }})
      </span>
    </div>

    <div class="flex">
      <div class="timeallowed">
        {{ c.msToTimeString(timeLeft) }}
        <span class="sub">left</span>
      </div>
      <div class="marleft reward success">
        {{ c.priceToString(contract.reward) }}
      </div>
    </div>

    <div class="arrow" v-if="contract.lastSeenLocation">
      <svg
        :style="{
          transform: `rotate(${angleTo}deg)`,
        }"
        width="404"
        height="233"
        viewBox="300 0 604 233"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="300"
          y1="116"
          x2="604"
          y2="116"
          stroke="white"
          stroke-width="10"
        />
        <line
          x1="600.464"
          y1="115.536"
          x2="488.464"
          y2="3.53553"
          stroke="white"
          stroke-width="10"
        />
        <line
          y1="-5"
          x2="158.392"
          y2="-5"
          transform="matrix(-0.707107 0.707107 0.707107 0.707107 604 121)"
          stroke="white"
          stroke-width="10"
        />
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {
    contract: { type: Object as PropType<Contract> },
  },
  data() {
    return { c, timeLeft: 0, angleTo: 0 }
  },
  computed: {
    ...mapState(['ship', 'crewMember', 'userId']),
  },
  watch: {},
  mounted() {
    this.update()
    setInterval(this.update, 1000 * 60)
  },
  methods: {
    update() {
      this.timeLeft =
        this.contract.timeAccepted +
        this.contract.timeAllowed -
        Date.now()

      this.angleTo = c.angleFromAToB(
        this.ship.location,
        this.contract.lastSeenLocation,
      )
    },
  },
})
</script>

<style lang="scss" scoped>
.contract {
  box-shadow: 0 0 0 1px rgba(white, 0.2);
  width: 100%;
  padding: 0.7em 1em;
  text-align: left;
  position: relative;
  border-radius: 5px;
  margin-bottom: 0.5em;
}

.arrow {
  display: flex;
  align-items: center;
  position: absolute;
  right: 0em;
  top: 50%;
  transform: translateY(-50%);

  svg {
    padding-left: 15px;
    width: 60px;
    height: 25px;
  }
}
</style>
