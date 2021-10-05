<template>
  <div>
    <div>
      <b>{{ c.capitalize(data.id) }}</b>
    </div>
    <hr />
    <div>{{ data.description }}</div>

    <template v-if="membersInRoom.length">
      <hr />
      <div
        v-for="crewMember of membersInRoom"
        :key="'inroom' + crewMember.id"
      >
        {{
          c.species[crewMember.speciesId] &&
          c.species[crewMember.speciesId].icon + ' '
        }}
        {{ crewMember.id === ship.captain ? '👑' : '' }}
        {{ crewMember.name }}
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: { data: {} },
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship']),
    membersInRoom() {
      return this.ship.crewMembers.filter(
        (cm: CrewMemberStub) =>
          cm.location === (this.data as any)?.id,
      )
    },
  },
})
</script>

<style scoped lang="scss"></style>
