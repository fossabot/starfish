<template>
  <div class="ship box">
    <h4>{{ ship.name }}</h4>
    <div class="box">
      <div>HP: {{ ship.hp }}</div>
      <div>
        Location: [{{
          ship.location.map((l) => l.toFixed(5)).join(', ')
        }}]
      </div>
      <div>
        Captain:
        {{
          ship.crewMembers
            ? ship.crewMembers.find(
                (cm) => cm.id === ship.captain,
              ).name
            : 'No Captain'
        }}
      </div>
      <div>Crew Members: {{ ship.crewMembers.length }}</div>
      <div>
        Faction:
        {{
          ship.faction ? ship.faction.name : 'No Faction'
        }}
      </div>
    </div>

    <div class="box">
      <div
        v-for="{ room, crewMembers } in crewByRoom"
        :key="'room' + room"
      >
        <b>{{ room }} ({{ crewMembers.length }})</b>
        <span v-for="crewMember in crewMembers">
          {{ crewMember.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return {}
  },
  computed: {
    ...mapState(['userId', 'ship', 'crewMember']),
    isCaptain(this: ComponentShape) {
      return this.ship?.captain === this.userId
    },
    crewByRoom(
      this: ComponentShape,
    ): { room: string; crewMembers: CrewMemberStub[] }[] {
      const byRoom: {
        room: string
        crewMembers: CrewMemberStub[]
      }[] = []
      for (let room of this.ship
        ?.availableRooms as string[]) {
        byRoom.push({
          room,
          crewMembers: this.ship.crewMembers.filter(
            (cm: CrewMemberStub) => cm.location === room,
          ),
        })
      }
      return byRoom
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.memshipber {
  position: relative;
}
</style>
