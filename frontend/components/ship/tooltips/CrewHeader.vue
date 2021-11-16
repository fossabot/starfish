<template>
  <div class="headerholder">
    <div class="tooltipheader">
      <img
        v-if="data.discordIcon"
        class="discordicon"
        :src="data.discordIcon"
      />
      {{ data.name }}
    </div>
    <hr style="margin-bottom: 0" />

    <div class="preview flexcenter flexcolumn">
      <div class="iconholder">
        <ShipCrewIcon
          :crewMember="data"
          :showDiscordIcon="false"
          :showTagline="true"
        />
      </div>
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
  computed: {},
})
</script>

<style scoped lang="scss">
.headerholder {
  padding-left: 0;
  padding-right: 0;
  padding-bottom: 0;
}
.tooltipheader {
  padding: 0;
  width: 200px;
  display: flex;
  align-items: center;
  padding-left: var(--tooltip-pad-lr);
  padding-right: var(--tooltip-pad-lr);
}
.discordicon {
  width: 1em;
  border-radius: 50%;
  margin-right: 0.3em;
}
.speciesicon {
  margin-right: 0.1em;
  line-height: 1;
}

.preview {
  padding: 15%;
  margin: 0;
  position: relative;
  width: 100%;
  background: radial-gradient(
    circle,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.3) 70%
  );
}
.iconholder {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
