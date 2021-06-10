<template>
  <div class="member" v-if="show">
    <Box>
      <template #title>
        <span class="sectionemoji">{{
          ship.species.icon
        }}</span
        >{{ crewMember.name }}
      </template>

      <div class="panesection">
        <div>
          🚪Location:
          {{ c.capitalize(crewMember.location) }}
        </div>
      </div>

      <ProgressBar
        :percent="
          crewMember.stamina / crewMember.maxStamina
        "
        @mouseenter="
          $store.commit(
            'tooltip',
            'Use stamina to perform actions on the ship. You will automatically go to sleep when you run out of stamina.',
          )
        "
        @mouseleave="$store.commit('tooltip')"
      >
        <div>
          💪Stamina:
          <NumberChangeHighlighter
            :number="
              c.r2(
                (crewMember.stamina /
                  crewMember.maxStamina) *
                  100,
                1,
              )
            "
            :display="
              c.r2(
                (crewMember.stamina /
                  crewMember.maxStamina) *
                  100,
                1,
              ) + '%'
            "
          />
        </div>
      </ProgressBar>

      <!-- <div class="panesection">
      <b>Go to</b>
      <div>
        <span
          v-for="room in ship.rooms"
          v-if="room !== crewMember.location"
          :key="'setroom' + room"
          class="padnone"
        >
          <button @click="$store.commit('setRoom', room)">
            {{ room }}
          </button>
        </span>
      </div>
    </div> -->

      <ShipMemberInventory />

      <ShipMemberSkills />

      <ShipMemberPassives />
    </Box>
  </div>
</template>

<script lang="ts">
import c from '../../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return { c }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
    show(this: ComponentShape) {
      return (
        this.ship &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('crewMember'))
      )
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.member {
  position: relative;
  grid-column: span 2;
  width: 250px;
}
.box {
  width: 100%;
}
</style>
