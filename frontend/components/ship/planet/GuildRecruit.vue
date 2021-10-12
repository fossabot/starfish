<template>
  <div
    class="guildrecruit panesection"
    v-if="
      ship &&
      planet &&
      planet.guildId &&
      c.guilds[planet.guildId] &&
      ship.guildId !== planet.guildId
    "
  >
    <div class="panesubhead">
      Join the
      <span :style="{ color: guild.color }"
        >{{ guild.name }} Guild</span
      >!
    </div>

    <div v-if="isCaptain">
      <div class="sub">
        Captain, you can join your ship into the
        {{ guild.name }} Guild<span v-if="changePrice">
          for {{ changePrice }} credits</span
        >. You can change guilds at guild homeworlds, but it
        will cost credits to switch.
      </div>
      <div>
        <button
          @click="joinGuild"
          :disabled="
            !!(
              changePrice &&
              ship.commonCredits < changePrice
            )
          "
          class="button big martopsmall"
        >
          <span
            >Join Guild: 💳{{
              c.numberWithCommas(changePrice)
            }}</span
          >
        </button>
      </div>
    </div>

    <div v-else class="sub">
      The captain can join your ship into the
      {{ guild.name }} Guild<span v-if="changePrice">
        for {{ changePrice }} credits</span
      >.
    </div>

    <div class="benefits martop">
      <div class="bold">
        {{ guild.name }} Guild members get:
      </div>

      <ul v-for="p in guild.passives" class="small success">
        <li><ShipPassiveText :passive="p" /></li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship', 'userId', 'crewMember']),
    changePrice(): number {
      return c.getGuildChangePrice(this.ship)
    },
    isCaptain(): boolean {
      return this.ship?.captain === this.userId
    },
    planet(): PlanetStub {
      return this.ship.planet
    },
    guild(): BaseGuildData {
      return c.guilds[
        (this.ship?.planet as any)?.guildId as GuildId
      ]
    },
  },
  watch: {},
  mounted() {},
  methods: {
    joinGuild() {
      if (
        this.ship.guildId &&
        !confirm('Are you sure you want to change guilds?')
      )
        return

      this.$store.commit('updateShip', {
        guildId: this.guild.id,
      })
      ;(this as any).$socket?.emit(
        'ship:joinGuild',
        this.ship.id,
        this.crewMember?.id,
        this.ship?.planet?.guildId,
        (res: IOResponse<CrewMemberStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
            return
          }
        },
      )
    },
  },
})
</script>

<style lang="scss" scoped></style>
