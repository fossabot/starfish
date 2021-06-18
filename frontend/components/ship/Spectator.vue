<template>
  <Box class="spectator" v-if="show">
    <template #title>
      <span class="sectionemoji">👀</span>Spectator Mode
    </template>
    <div class="panesection">
      You're in <b>spectator mode</b>, which means you're
      not yet a member of this ship's crew. You can watch
      the action from here, or you can join your server's
      ship by using the <b>join</b>
      command in Discord!
    </div>
  </Box>
</template>

<script lang="ts">
import c from '../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return { c, selectedShip: null }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
    show(this: ComponentShape) {
      return this.ship && !this.crewMember
    },
  },
}
</script>

<style lang="scss" scoped>
.spectator {
  width: 300px;
}
</style>
