<template>
  <div class="tabs">
    <div
      class="tabheader hidescrollbar padbot"
      :class="{
        flexcenter: centerTabs,
        flexstretch: bigTabs,
      }"
      v-if="!dropdown"
    >
      <div
        v-for="(tab, index) in tabs"
        :key="tab.title"
        @click="selectTab(index)"
        class="button nowrap combo"
        :class="{
          small: !bigTabs,
          medium: bigTabs,
          secondary: selectedIndex !== index,
          arrowdown: selectedIndex === index,
        }"
      >
        <span>{{ tab.title }}</span>
      </div>
    </div>
    <div
      class="tabheader"
      :class="{
        small: !bigTabs,
        medium: bigTabs,
        padbot: $slots.default && $slots.default.innerHTML,
        padnone: noPad,
      }"
      v-else
    >
      <select v-model="dropdownSelection">
        <option
          v-for="(tab, index) in tabs"
          :key="tab.title"
          :value="index"
        >
          {{ tab.title }}
        </option>
      </select>
    </div>
    <div class="contents" :class="{ padnone: noPad }">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import c from '../../common/dist'

export default Vue.extend({
  props: {
    dropdown: { type: Boolean, default: false },
    noPad: { type: Boolean, default: false },
    centerTabs: { type: Boolean, default: false },
    bigTabs: { type: Boolean, default: false },
  },
  data() {
    let tabs: Vue[] = []
    return {
      c,
      dropdownSelection: 0,
      selectedIndex: 0,
      tabs,
    }
  },
  computed: {
    ...mapState([]),
  },
  watch: {
    dropdownSelection() {
      this.selectTab(this.dropdownSelection)
      this.$emit(
        'input',
        (this.tabs[this.dropdownSelection] as any)?.title,
      )
    },
  },
  created() {
    this.tabs = this.$children
  },
  mounted() {
    this.selectTab(0)
  },
  methods: {
    selectTab(i) {
      this.selectedIndex = i

      this.tabs.forEach(
        (tab, index) =>
          ((tab as any).isActive = index === i),
      )
    },
  },
})
</script>

<style lang="scss" scoped>
.tabs {
  padding-bottom: var(--panesectionpad-top);
  padding-top: var(--panesectionpad-top);
}
.tabheader {
  display: flex;
  flex-wrap: wrap;
  // overflow-x: auto;
  padding-left: var(--panesectionpad-left);
  padding-right: var(--panesectionpad-left);

  & > * {
    flex-shrink: 0;
  }
}
.contents:not(.padnone) {
  padding: 0 var(--panesectionpad-left);
}
</style>
