<template>
  <div>
    <div
      v-for="crewMember of membersWhoReacted"
      :key="'reacted' + crewMember.id"
    >
      {{
        c.species[crewMember.speciesId] &&
        c.species[crewMember.speciesId].icon + ' '
      }}
      {{ crewMember.name }}
    </div>
  </div>
</template>

<script>
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
    membersWhoReacted() {
      return this.ship.crewMembers.filter((m) =>
        this.data.orderReactions.find(
          (r) =>
            r.id === m.id &&
            this.data.reaction === r.reaction,
        ),
      )
    },
  },
})
</script>

<style scoped lang="scss"></style>
