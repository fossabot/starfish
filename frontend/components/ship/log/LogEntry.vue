<template>
  <div class="logentry" :class="level">
    <div class="time flashtextgoodonspawn">
      [{{ timeString }}]
    </div>
    <div class="text flashtextgoodonspawn">{{ text }}</div>
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
  border-left: 2px solid var(--highlight-color);
  color: var(--text);
}

.time {
  opacity: 0.5;
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
