<template>
  <div class="boxholder">
    <div class="box">
      <div class="title">
        <div ref="title">
          <slot name="title" />
        </div>
        <div
          class="minimize"
          @click="minimized = !minimized"
        >
          -
        </div>
      </div>
      <div class="pane" v-if="!minimized">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'
import * as storage from '../assets/scripts/storage'
interface ComponentShape {
  [key: string]: any
}

export default {
  props: {},
  data(): ComponentShape {
    return {
      minimized: false,
    }
  },
  computed: {
    ...mapState([]),
  },
  watch: {
    minimized() {
      const existing: string[] = JSON.parse(
        storage.get('minimizedPanes') || '[]',
      )
      const key =
        this.$refs.title instanceof Element
          ? this.$refs.title.innerHTML
          : ''
      if (this.minimized) {
        if (!existing.find((s) => s === key))
          existing.push(key)
        storage.set(
          'minimizedPanes',
          JSON.stringify(existing),
        )
      } else {
        const index = existing.findIndex((s) => s === key)
        if (index !== -1) existing.splice(index, 1)
        storage.set(
          'minimizedPanes',
          JSON.stringify(existing),
        )
      }
    },
  },
  mounted(this: ComponentShape) {
    const preMinimized: string[] = JSON.parse(
      storage.get('minimizedPanes') || '[]',
    )
    const key =
      this.$refs.title instanceof Element
        ? this.$refs.title.innerHTML
        : ''
    if (preMinimized.includes(key)) this.minimized = true
  },
  methods: {},
}
</script>

<style lang="scss" scoped>
.boxholder {
  padding: 0.7em;

  @media (max-width: 768px) {
    width: 100% !important;

    .box {
      width: 100% !important;
    }
  }
}
.box {
  position: relative;
  z-index: 3;
  box-shadow: 0 5px 20px -5px var(--bg);
  background: var(--pane-bg);
  overflow: hidden;

  .title {
    position: relative;
    width: 100%;
    padding-top: 2px;
    height: 20px;
    background: var(--pane-border);
    color: var(--text);
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: bold;
    line-height: 1;
    text-transform: uppercase;
    padding-left: 0.5rem;
    box-shadow: inset 0 0 0 1px var(--pane-border),
      0 0 0 1px var(--pane-border);
    z-index: 4;
  }

  .pane {
    position: relative;
    z-index: 3;
    width: 100%;
    display: inline-flex;
    flex-direction: column;

    // box-shadow: inset 0 1px 0 1px var(--pane-border);
    border: 1px solid var(--pane-border);
    border-top: none;
    // border-bottom: 0.5px solid var(--pane-border);
  }
}

.minimize {
  width: 2em;
  height: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(black, 0.1);
  }
}
</style>
