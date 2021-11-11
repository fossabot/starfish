<template>
  <div class="logentry flexstretch" :class="level">
    <div class="icon flex">
      <img :src="`/images/log/${icon || 'alert'}.svg`" />
    </div>
    <div class="content flexbetween">
      <div class="text flashtextgoodonspawn">
        <template v-for="(el, index) in outputElements">
          <span
            :key="id + index"
            :style="
              (el.style || '') +
              (el.color ? `; color: ${el.color};` : '')
            "
            v-tooltip="el.tooltipData"
            :class="{ tooltip: el.tooltipData }"
            ><a v-if="el.url" :href="el.url">{{
              (el.text || el).replace(/\s*&nospace/g, '')
            }}</a>
            <template v-else>{{
              (el.text || el).replace(/\s*&nospace/g, '')
            }}</template></span
          ><span
            class="space"
            v-if="
              outputElements[index + 1] &&
              (
                outputElements[index + 1].text ||
                outputElements[index + 1]
              ).indexOf('&nospace') !== 0
            "
            >&#32;
          </span>
        </template>
      </div>
      <div class="sub time flashtextgoodonspawn padtoptiny">
        {{ timeString }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import c from '../../../../common/dist'
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {
    content: {
      type: [String, Array] as PropType<
        string | RichLogContentElement[]
      >,
    },
    time: { type: Number },
    level: {},
    icon: {},
  },
  data() {
    return { c, timeString: '', id: Math.random() }
  },
  computed: {
    outputElements(): any[] | false {
      if (!Array.isArray(this.content))
        return [this.content]
      return this.content.filter((el) => !el.discordOnly)
    },
  },
  watch: {},
  mounted() {
    this.resetTimeString()
    setInterval(() => this.resetTimeString(), 1 * 60 * 1000)
  },
  methods: {
    resetTimeString() {
      this.timeString = c.msToTimeString(
        Date.now() - this.time,
        true,
      )
    },
  },
})
</script>

<style lang="scss" scoped>
.logentry {
  position: relative;
  -webkit-backface-visibility: none;
  line-height: 1.15;
  letter-spacing: -0.01em;
  margin-bottom: 0.5em;
  color: var(--text);
  border-radius: 0.2em;
  overflow: hidden;
  // background: rgba(255, 255, 255, 0.05);
  word-break: break-word;
}

.icon {
  position: relative;
  background: var(--highlight-color);
  padding: 4px;
  flex-shrink: 0;
  align-items: center;

  img {
    opacity: 0.7;
    width: 100%;
    max-width: 18px;
    max-height: 18px;
  }
}

.content {
  width: 100%;
  padding: 0.4em 0.5em 0.3em 0.5em;
  background: rgba(45, 45, 45, 0.8);
}

.time {
  // opacity: 0.5;
  color: var(--text);
  word-break: normal;
  margin-left: 0.7em;
}

.text {
  color: var(--text);
}

.low {
  --highlight-color: #666;
}
.medium {
  --highlight-color: #aaa;
}
.high {
  --highlight-color: rgb(220, 183, 74);
}
.critical {
  --highlight-color: rgb(230, 79, 41);
}
.notify {
  --highlight-color: rgb(230, 79, 41);
}

// .tooltip {
// background: rgba(white, 0.1);
// }
</style>
