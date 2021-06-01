<template>
  <div
    class="roommember flex-column flex-center"
    :class="{ hide, highlight, animate }"
    :style="{
      top: top + 'px',
      left: left + 'px',
    }"
  >
    <div>
      {{ ship.species.icon }}
    </div>
    <div class="name">
      {{ name }}
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  props: {
    name: {},
    location: {},
    roomEls: {},
    highlight: {},
  },
  data(): ComponentShape {
    return {
      animate: false,
      hide: false,
      top: 0,
      left: 0,
    }
  },
  computed: {
    ...mapState(['ship']),
  },
  watch: {
    location(this: ComponentShape) {
      this.calculateNewPosition()
    },
  },
  mounted(this: ComponentShape) {
    this.calculateNewPosition()
    setTimeout(() => (this.animate = true), 1000)
  },
  methods: {
    calculateNewPosition(this: ComponentShape) {
      let targetElement = this.roomEls[
        this.location
      ] as HTMLDivElement
      if (!targetElement) return (this.hide = true)
      if (Array.isArray(targetElement))
        targetElement = targetElement[0] as HTMLDivElement
      this.hide = false
      const parentBCR = targetElement.getBoundingClientRect()
      const parentTop = targetElement.offsetTop
      const parentLeft = targetElement.offsetLeft
      // console.log(parentBCR, parentTop, parentLeft)

      const paddingLeft = this.$el.offsetWidth / 1.5
      const paddingTop = this.$el.offsetHeight / 1.5

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
}
</script>

<style lang="scss" scoped>
.roommember {
  transform-origin: 50% 50%;
  line-height: 0.8;
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
    color: #ccc;
    z-index: 2;
  }

  &.animate {
    transition: top 1s, left 1s;
  }
}

.name {
  font-size: 0.85em;
  font-weight: bold;
  text-transform: uppercase;
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
