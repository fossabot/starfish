<template>
  <div class="tabs">
    <div
      class="tabheader hidescrollbar padbot"
      v-if="!dropdown"
    >
      <div
        v-for="(tab, index) in tabs"
        :key="tab.title"
        @click="selectTab(index)"
        class="button small nowrap combo"
        :class="{ secondary: selectedIndex !== index }"
      >
        {{ c.capitalize(tab.title) }}
      </div>
    </div>
    <div class="tabheader padbot small" v-else>
      <select v-model="dropdownSelection">
        <option
          v-for="(tab, index) in tabs"
          :key="tab.title"
          :value="index"
        >
          {{ c.capitalize(tab.title) }}
        </option>
      </select>
    </div>
    <div class="contents">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import c from '../../common/dist'

export default Vue.extend({
  props: { dropdown: { type: Boolean, default: false } },
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
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-left: var(--panesectionpad-left);
  padding-right: var(--panesectionpad-left);

  & > * {
    flex-shrink: 0;
  }
}
.contents {
  padding: 0 var(--panesectionpad-left);
}
</style>
