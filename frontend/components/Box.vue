<template>
  <div
    class="boxholder"
    :class="{ mobile: isMobile, minimized }"
  >
    <div class="box flexcolumn" :class="{ highlight }">
      <div class="gradient" />
      <div
        class="bgimage"
        v-if="bgImage"
        :style="{ 'background-image': `url('${bgImage}')` }"
      />
      <div
        class="bgtint"
        v-if="bgTint"
        :style="{ 'background-color': bgTint }"
      />
      <div
        class="title"
        :class="{ overlay: !minimized && overlayTitle }"
      >
        <div ref="title">
          <slot name="title" />
        </div>
        <div
          v-if="minimizable"
          class="minimize pointer"
          @click="minimized = !minimized"
        >
          -
        </div>
      </div>
      <div class="pane" v-if="!minimizable || !minimized">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import * as storage from '../assets/scripts/storage'

export default Vue.extend({
  props: {
    highlight: {},
    bgImage: {},
    bgTint: {},
    overlayTitle: {},
    minimizable: { default: true },
  },
  data() {
    return {
      minimized: false,
    }
  },
  computed: {
    ...mapState(['ship', 'isMobile']),
  },
  watch: {
    minimized() {
      if (this.minimized) this.$emit('minimize')
      else this.$emit('unminimize')

      const existing: string[] = JSON.parse(
        storage.get('minimizedPanes') || '[]',
      )
      const key: string =
        this.$refs.title instanceof Element
          ? this.$refs.title.innerHTML?.replace(
              /(<.*>|\s|\n)*/g,
              '',
            )
          : (this.bgImage as string) || ''
      if (!key) return
      if (this.minimized) {
        if (!existing.find((s) => s === key))
          existing.push(key)
        storage.set(
          'minimizedPanes',
          JSON.stringify(existing.filter((k) => k)),
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
  mounted() {
    if (!this.minimizable) return
    const preMinimized: string[] = JSON.parse(
      storage.get('minimizedPanes') || '[]',
    )
    const key =
      this.$refs.title instanceof Element
        ? this.$refs.title.innerHTML?.replace(
            /(<.*>|\s|\n)*/g,
            '',
          )
        : (this.bgImage as string) || ''
    if (preMinimized.includes(key)) this.minimized = true
    if (this.minimized) this.$emit('minimize')
    else this.$emit('unminimize')
  },
  methods: {},
})
</script>

<style lang="scss" scoped>
.boxholder {
  padding: 1em;

  &.minimized {
    min-width: 250px;
  }

  @media (max-width: 768px) {
    width: 100% !important;
    padding: 0.5em;

    .box {
      width: 100% !important;
    }
  }
}
.box {
  position: relative;
  z-index: 3;
  box-shadow: 0 5px 20px -5px var(--bg), 0 1px 3px var(--bg);
  background: var(--pane-bg);
  overflow: hidden;
  transition: box-shadow 0.2s;
  border-radius: 10px;
  user-select: none;

  &.highlight {
    // --gray: #bbb;
    animation: box-glow 1s ease-in-out infinite alternate;
  }

  & > * {
    position: relative;
    z-index: 4;
  }

  .gradient,
  .bgimage,
  .bgtint {
    z-index: 3;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .gradient {
    opacity: 0.9;
    background: linear-gradient(
      to bottom,
      #1d1d1d,
      transparent
    );
  }
  .bgimage {
    z-index: 2;
    background-size: cover;
    background-position: center center;
    opacity: 0.25;
  }
  .bgtint {
    z-index: 2;
    mix-blend-mode: hue;
    opacity: 0.7;
  }

  .title {
    font-size: 1.15em;
    pointer-events: none;
    position: relative;
    width: 100%;
    padding-left: 0.8rem;
    height: 33px;
    // background: var(--gray);
    color: var(--text);
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: bold;
    line-height: 1;
    text-transform: uppercase;
    // box-shadow: inset 0 0 0 1px var(--gray),
    //   0 0 0 1px var(--gray);
    z-index: 5;
    margin-bottom: -0.4em;

    transition: background 0.2s, box-shadow 0.2s;

    &.overlay {
      position: absolute;
    }
  }

  .pane {
    position: static;
    // position: relative;
    // z-index: 3;
    width: 100%;
    display: inline-flex;
    flex-direction: column;
    overflow: hidden;

    transition: box-shadow 0.2s;
  }
}

.minimize {
  width: 2em;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  border-bottom-left-radius: 1em;

  &:hover {
    background: rgba(white, 0.1);
  }
}

@keyframes box-glow {
  0% {
    box-shadow: 0 0px 3px 2px hsla(50, 100%, 65%, 0.3);
  }
  100% {
    box-shadow: 0 0px 15px 3px hsla(48, 100%, 59%, 0.5);
  }
}

// .box {
//   position: relative;
//   z-index: 3;
//   box-shadow: 0 5px 20px -5px var(--bg);
//   background: var(--pane-bg);
//   overflow: hidden;
//   transition: box-shadow 0.2s;

//   &.highlight {
//     // --gray: #bbb;
//     animation: box-glow 1s ease-in-out infinite alternate;
//   }

//   .title {
//     position: relative;
//     width: 100%;
//     padding-top: 2px;
//     height: 20px;
//     background: var(--gray);
//     color: var(--text);
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//     font-weight: bold;
//     line-height: 1;
//     text-transform: uppercase;
//     padding-left: 0.5rem;
//     box-shadow: inset 0 0 0 1px var(--gray),
//       0 0 0 1px var(--gray);
//     z-index: 4;

//     transition: background 0.2s, box-shadow 0.2s;
//   }

//   .pane {
//     position: relative;
//     z-index: 3;
//     width: 100%;
//     display: inline-flex;
//     flex-direction: column;
//     overflow: hidden;

//     // box-shadow: inset 0 1px 0 1px var(--gray);
//     border: 1px solid var(--gray);
//     border-top: none;
//     // border-bottom: 0.5px solid var(--gray);

//     transition: box-shadow 0.2s;
//   }
// }

// .minimize {
//   width: 2em;
//   height: 100%;
//   display: flex;
//   align-items: center;
//   justify-content: center;

//   &:hover {
//     background: rgba(black, 0.1);
//   }
// }

// @keyframes box-glow {
//   0% {
//     box-shadow: 0 0px 3px 2px hsla(50, 100%, 65%, 0.3);
//   }
//   100% {
//     box-shadow: 0 0px 15px 3px hsla(48, 100%, 59%, 0.5);
//   }
// }
</style>
