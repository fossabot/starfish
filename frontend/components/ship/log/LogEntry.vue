<template>
  <div class="logentry" :class="level">
    <div class="time">[{{ timeString }}]</div>
    <div class="text">{{ text }}</div>
  </div>
</template>

<script lang="ts">
import relativeTime from 'dayjs/plugin/relativeTime'
import dayjs from 'dayjs'
dayjs.extend(relativeTime)

import { mapState } from 'vuex'
interface ComponentShape {
  time: number
  [key: string]: any
}

export default {
  props: { text: {}, time: {}, level: {} },
  data(): Partial<ComponentShape> {
    return { timeString: '' }
  },
  computed: {},
  watch: {},
  mounted(this: ComponentShape) {
    this.resetTimeString()
    setInterval(() => this.resetTimeString(), 1 * 60 * 1000)
  },
  methods: {
    resetTimeString(this: ComponentShape) {
      this.timeString = dayjs().to(this.time)
    },
  },
}
</script>

<style lang="scss" scoped>
.logentry {
  line-height: 1.2;
  margin-bottom: 0.8em;
  padding-left: 0.6em;
  border-left: 2px solid currentColor;
}

.time {
  opacity: 0.5;
  color: var(--text);
}

.text {
  color: var(--text);
}

.low {
  color: #444;
}
.medium {
  color: #aaa;
}
.high {
  color: rgba(255, 200, 0, 0.9);
}
.critical {
  color: red;
}
</style>
