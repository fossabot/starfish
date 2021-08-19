<template>
  <div class="logentry" :class="level">
    <div class="text flashtextgoodonspawn">
      <span
        v-if="outputElements"
        v-for="(el, index) in outputElements"
        :key="id + index"
        :style="
          (el.style || '') +
            (el.color ? `; color: ${el.color};` : '')
        "
        v-tooltip="el.tooltipData"
        :class="{ tooltip: el.tooltipData }"
        ><span
          v-if="
            (el.text || el).indexOf('&nospace') !== 0 &&
              index !== 0
          "
          >&nbsp;</span
        ><a v-if="el.url" :href="el.url">{{
          (el.text || el).replace(/\s*&nospace/g, '')
        }}</a>
        <span v-else>{{
          (el.text || el).replace(/\s*&nospace/g, '')
        }}</span>
      </span>
      <span v-else>
        {{ outputText }}
      </span>
    </div>
    <div class="sub time flashtextgoodonspawn padtoptiny">
      {{ timeString }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
import { mapState } from 'vuex'

export default Vue.extend({
  props: {
    content: {
      type: [String, Object] as PropType<
        string | RichLogContentElement[]
      >,
    },
    time: { type: Number },
    level: {},
  },
  data() {
    return { timeString: '', id: Math.random() }
  },
  computed: {
    outputElements(): any[] | false {
      if (!Array.isArray(this.content)) return false
      return this.content
    },

    outputText(): string {
      return (typeof this.content === 'string'
        ? this.content
        : Array.isArray(this.content)
        ? this.content.map((c) => c.text || c).join(' ')
        : `${this.content}`
      ).replace(/\s*&nospace/g, '')
    },
  },
  watch: {},
  mounted() {
    this.resetTimeString()
    setInterval(() => this.resetTimeString(), 1 * 60 * 1000)
  },
  methods: {
    resetTimeString() {
      this.timeString = dayjs().to(this.time)
    },
  },
})
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

// .tooltip {
// background: rgba(white, 0.1);
// }
</style>
