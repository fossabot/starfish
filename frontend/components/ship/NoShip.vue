<template>
  <Box class="noShip" v-if="show">
    <template #title>
      <span class="sectionemoji">👋</span>Welcome
    </template>
    <div class="panesection">
      <div class="marbot">
        You're almost done!
        <br />
        <br />
        If your server already has a ship, run
        <code>.join</code> in Discord to join the ship.
        <br />
        <br />
        Otherwise, add the game's bot to your Discord server
        and run
        <code>.start</code> to get started.
        <br />
        <br />
        <a
          :href="c.discordBotInviteUrl"
          target="_blank"
          class="button big"
          >Add the Discord bot to your server!</a
        >
      </div>

      <br /><br /><br />
      <hr style="opacity: 0.1" />

      <div class="sub">
        This message is appearing because we couldn't find
        any ships associated with your id. If you're sure
        that your server has a ship in the game, try logging
        out and back in. If that doesn't fix it, please
        reach out on the support server.
      </div>
    </div>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/src'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c, selectedShip: null }
  },
  computed: {
    ...mapState(['ship', 'crewMember', 'lastUpdated']),
    show() {
      return this.lastUpdated && !this.ship
    },
  },
})
</script>

<style lang="scss" scoped>
.noShip {
  width: 400px;
}
</style>
