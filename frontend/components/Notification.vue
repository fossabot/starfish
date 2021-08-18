<template>
  <div class="notification">
    <span
      v-html="text"
      :class="type + ' ' + (hide ? 'hide ' : '')"
      @click="hide = true"
    ></span>
  </div>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'notification',
  props: {
    text: {},
    type: {},
  },
  data() {
    return {
      hide: false,
    }
  },
  mounted() {},
})
</script>

<style lang="scss" scoped>
.notification {
  color: var(--bg);
  margin-bottom: 3px;
  transition: all 0.2s;
  width: 70vw;
  display: inline-block;
  white-space: nowrap;

  .hide {
    opacity: 0;
    pointer-events: none;
  }

  span {
    display: inline-flex;
    transform: translateX(-50%);

    align-items: center;
    padding: 7px 12px;
    background: var(--text);

    &.error {
      background: var(--warning);
      color: var(--text);
    }
    &.info {
      background: var(--info);
      color: var(--text);
    }
    &.success {
      background: var(--success);
      color: var(--text);
    }
  }
}
</style>
