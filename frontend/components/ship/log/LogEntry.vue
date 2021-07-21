<template>
  <div class="logentry" :class="level">
    <div class="text flashtextgoodonspawn">{{ text }}</div>
    <div class="sub time flashtextgoodonspawn padtoptiny">
      {{ timeString }}
    </div>
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
  line-height: 1.15;
  letter-spacing: -0.01em;
  margin-bottom: 1.5em;
  padding: 0em 0.4em 0em 0.6em;
  border-left: 3px solid var(--highlight-color);
  color: var(--text);
  border-radius: 0.2em;
  overflow: hidden;
  // background: rgba(255, 255, 255, 0.05);
  word-break: break-word;
}

.time {
  // opacity: 0.5;
  color: var(--text);
}

.text {
  color: var(--text);
}

.low {
  --highlight-color: #444;
}
.medium {
  --highlight-color: #aaa;
}
.high {
  --highlight-color: rgba(255, 200, 0, 0.9);
}
.critical {
  --highlight-color: red;
}
</style>
