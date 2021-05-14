<template>
  <div class="member box">
    <h4>{{ crewMember.name }}</h4>

    <div class="box">
      <div>Location: {{ crewMember.location }}</div>
    </div>

    <div class="box">
      <div>
        Stamina:
        {{ Math.round(crewMember.stamina * 1000) / 1000 }}
      </div>
    </div>

    <div class="box">
      <b>Go to</b>
      <div>
        <span
          v-for="room in ship.availableRooms"
          v-if="room !== crewMember.location"
          :key="'setroom' + room"
          class="pad-none"
        >
          <button @click="$store.commit('setRoom', room)">
            {{ room }}
          </button>
        </span>
      </div>
    </div>

    <ShipMemberInventory />

    <ShipMemberSkills />
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
    ...mapState(['ship', 'crewMember']),
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.member {
  position: relative;
}
</style>
