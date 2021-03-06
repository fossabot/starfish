<template>
  <div
    class="roommember flexcolumn flexcenter"
    :class="{ hide, highlight, animate }"
    :style="{
      top: top + 'px',
      left: left + 'px',
    }"
  >
    <div class="icon">
      <ShipCrewIcon
        v-if="c.species[crewMember.speciesId]"
        v-tooltip="{
          type: 'species',
          ...c.species[crewMember.speciesId],
        }"
        :crewMember="crewMember"
        :showDiscordIcon="false"
        :hoverable="false"
      />
    </div>
    <div class="name">
      {{ ship.captain === crewMember.id ? '👑' : ''
      }}{{ crewMember.name }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'
import c from '../../../../common/dist'

export default Vue.extend({
  props: {
    crewMember: {
      type: Object as PropType<CrewMemberStub>,
      required: true,
    },
    location: {},
    roomEls: {
      type: Object as PropType<{
        [key in CrewLocation]: HTMLDivElement
      }>,
    },
    highlight: { type: Boolean },
  },
  data() {
    return {
      c,
      animate: false,
      hide: false,
      top: 0,
      left: 0,
    }
  },
  computed: {
    ...mapState(['ship']),
    roomCount(): number {
      return this.ship.rooms.length
    },
  },
  watch: {
    location() {
      this.calculateNewPosition()
    },
    roomCount(n, o) {
      if (n === o) return
      this.calculateNewPosition()
    },
  },
  mounted() {
    this.calculateNewPosition()
    setTimeout(() => (this.animate = true), 1000)
  },
  methods: {
    calculateNewPosition() {
      let targetElement = this.roomEls[
        this.crewMember.location || 'bunk'
      ] as HTMLDivElement
      if (!targetElement) return (this.hide = true)
      if (Array.isArray(targetElement))
        targetElement = targetElement[0] as HTMLDivElement
      this.hide = false
      const parentBCR =
        targetElement.getBoundingClientRect()
      const parentTop = targetElement.offsetTop
      const parentLeft = targetElement.offsetLeft
      // c.log(parentBCR, parentTop, parentLeft)

      const paddingLeft =
        (this.$el as HTMLElement).offsetWidth / 1.5
      const paddingTop =
        (this.$el as HTMLElement).offsetHeight / 1.5

      const minLeft = parentLeft + paddingLeft,
        maxLeft =
          parentLeft + parentBCR.width - paddingLeft * 2,
        minTop = parentTop + paddingTop,
        maxTop =
          parentTop + parentBCR.height - paddingTop * 2,
        leftRange = maxLeft - minLeft,
        topRange = maxTop - minTop
      this.top = minTop + Math.random() * topRange
      this.left = minLeft + Math.random() * leftRange
    },
  },
})
</script>

<style lang="scss" scoped>
.roommember {
  pointer-events: none;
  transform-origin: 50% 50%;
  line-height: 1.1;
  position: absolute;
  padding: 0;
  top: 0;
  left: 0;
  // animation: float 25s ease-in-out infinite alternate;

  &.highlight {
    color: white;
    z-index: 3;
  }

  &:not(.highlight) {
    font-size: 0.8em;
    color: #999;
    z-index: 2;
  }

  &.animate {
    transition: top 1s, left 1s;
  }
}

.icon {
  position: relative;
  z-index: 1;
  width: 1.4em;
  height: 1.4em;
}

.name {
  position: relative;
  top: -0.2em;
  z-index: 2;
  font-size: 0.85em;
  font-weight: bold;
  // text-transform: uppercase;
  max-width: 10em;
  white-space: nowrap;
  overflow: hidden;
}

.hide {
  display: none;
}

@keyframes float {
  0% {
    transform: translate(-50%, -50%);
  }
  50% {
    transform: translate(50%, 0%);
  }
  75% {
    transform: translate(-50%, 0%);
  }
  100% {
    transform: translate(50%, 50%);
  }
}
</style>
