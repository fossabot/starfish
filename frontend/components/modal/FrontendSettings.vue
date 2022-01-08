<template>
  <div class="frontendsettings flexcenter flexcolumn">
    <h2 class="marbotbig">Interface Settings</h2>
    <Toggle
      label="Disable Animations"
      :setTo="settingsToUse.disableAnimations"
      @toggled="
        updateSetting('disableAnimations', !settingsToUse.disableAnimations)
      "
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'
import { get, set } from '../../assets/scripts/storage'

export default Vue.extend({
  props: {},
  data() {
    return { c }
  },
  computed: {
    ...mapState(['frontendSettings']),
    settingsToUse(): any {
      return {
        disableAnimations: !!this.frontendSettings.disableAnimations,
      }
    },
  },
  watch: {},
  mounted() {},
  methods: {
    updateSetting(key: string, value: any) {
      this.$store.commit('set', {
        frontendSettings: {
          ...this.frontendSettings,
          [key]: value,
        },
      })
      set('frontendSettings', JSON.stringify(this.frontendSettings))
      c.log(get('frontendSettings'))
    },
  },
})
</script>

<style lang="scss" scoped>
.frontendsettings {
  text-align: center;
  width: 100%;
  line-height: 1.3;
}
.options {
  width: 100%;
  display: grid;
  grid-gap: 1em;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.icon {
  font-size: 3.5rem;
}
.option {
  justify-content: flex-start;
  padding: 1em;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
}

.activetree {
  max-width: 150px;
  grid-gap: 0.8em;
}

hr {
  width: 80%;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin: 1em 0;
}
</style>
