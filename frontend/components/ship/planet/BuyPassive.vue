<template>
  <div
    class="panesection"
    v-if="ship.planet && ship.planet.vendor.passives.length"
  >
    <div>
      <div class="panesubhead">Personal Outfitter</div>
    </div>
    <button
      v-for="passive in ship.planet.vendor.passives"
      :disabled="
        crewMember.credits <
          passive.passiveData.basePrice *
            passive.buyMultiplier *
            ship.planet.buyFluctuator *
            (isSameFaction
              ? c.factionVendorMultiplier
              : 1) *
            c.getCrewPassivePriceMultiplier(
              crewMemberPassiveLevels[
                passive.passiveData.type
              ] || 0,
            )
      "
      @click="buyPassive(passive.passiveData.type)"
    >
      {{ passive.passiveData.displayName }} Lv.{{
        (crewMemberPassiveLevels[
          passive.passiveData.type
        ] || 0) + 1
      }}: 💳{{
        c.r2(
          passive.passiveData.basePrice *
            passive.buyMultiplier *
            (isSameFaction
              ? c.factionVendorMultiplier
              : 1) *
            c.getCrewPassivePriceMultiplier(
              crewMemberPassiveLevels[
                passive.passiveData.type
              ] || 0,
            ),
          2,
        )
      }}
    </button>
  </div>
</template>

<script lang="ts">
import c from '../../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): Partial<ComponentShape> {
    return { c }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),

    isSameFaction(this: ComponentShape) {
      return (
        this.ship.planet.faction?.id ===
        this.ship.faction.id
      )
    },

    crewMemberPassiveLevels(this: ComponentShape) {
      const levels: {
        [key in CrewPassiveType]?: number
      } = {}
      for (let p of this.crewMember.passives || []) {
        levels[p.type as CrewPassiveType] = p.level
      }
      return levels
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {
    buyPassive(
      this: ComponentShape,
      type: CrewPassiveType,
    ) {
      this.$socket?.emit(
        'crew:buyPassive',
        this.ship.id,
        this.crewMember.id,
        type,
        this.ship?.planet?.name,
        (res: IOResponse<CrewMemberStub>) => {
          if ('error' in res) {
            console.log(res.error)
            return
          }
        },
      )
    },
  },
}
</script>

<style lang="scss" scoped></style>
