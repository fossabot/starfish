<template>
  <div class="guildbadges">
    <img
      v-for="id in guilds"
      :src="`/images/guildBadges/badge-${id}.png`"
    />
  </div>
</template>

<script>
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {
    guilds: {},
  },
  data() {
    return { c }
  },
  computed: {},
  mounted() {},
})
</script>

<style scoped lang="scss">
.guildbadges {
  position: absolute;
  z-index: 4;
  top: 0;
  right: 0.2em;
  display: flex;
  flex-direction: row-reverse;

  img {
    width: 35px;
    display: block;
    position: relative;
    margin-left: -0.35em;
  }
}
</style>
