<template>
  <div class="panesection" v-if="ship.planet">
    <div
      class="sub padbig flexcenter"
      v-if="!ship.planet.contracts.length"
    >
      <div>
        No contracts available at the moment, check back
        later!
      </div>
    </div>
    <div v-else>
      <div class="textcenter">
        <b
          >{{ availableContracts.length }} contract{{
            availableContracts.length === 1 ? '' : 's'
          }}</b
        >
        available
      </div>
      <ShipPlanetContract
        v-for="contract in availableContracts"
        :key="'ac' + contract.id"
        :contract="contract"
        @click="accept(contract.id)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship', 'crewMember', 'userId']),
    isFriendlyToGuild(): boolean {
      return (
        (this.ship.planet.allegiances.find(
          (a: PlanetAllegianceData) =>
            a.guildId === this.ship.guildId,
        )?.level || 0) >= c.guildAllegianceFriendCutoff
      )
    },
    availableContracts(): PlanetContractAvailable[] {
      return this.ship.planet.contracts
    },
  },
  watch: {},
  mounted() {},
  methods: {
    accept(id: string) {
      ;(this as any).$socket?.emit(
        'ship:acceptContract',
        this.ship.id,
        this.crewMember?.id,
        id,
        (res: IOResponse<Contract>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            c.log(res.error)
            return
          }
        },
      )
    },
  },
})
</script>

<style lang="scss" scoped>
.panesection {
  padding-top: 0;
}
</style>
