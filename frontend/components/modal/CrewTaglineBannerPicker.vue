<template>
  <div class="flexcenter flexcolumn">
    <h2>Customize Yourself</h2>

    <h3 class="padtop padbot">Choose Tagline</h3>
    <div class="flexcenter flexwrap marbot">
      <div
        class="preview flexcenter pointer fade"
        @click="setTagline(null)"
        :class="{ current: !currentTagline }"
      >
        (No tagline)
      </div>
      <div
        class="preview flexcenter pointer"
        :class="{ current: option === currentTagline }"
        v-for="option in crewMember.availableTaglines || []"
        :key="'to' + option"
        @click="setTagline(option)"
      >
        <div>
          {{ option }}
        </div>
      </div>
    </div>

    <h3 class="padtop padbot">Choose Background</h3>
    <div class="flexcenter flexwrap">
      <div
        class="preview flexcenter flexcolumn pointer"
        :class="{
          current:
            option.url === currentBanner ||
            (option.id === 'Default' &&
              currentBanner === 'default.svg'),
        }"
        v-for="option in [
          { id: 'Default', url: 'default.svg' },
          ...(crewMember.availableBackgrounds || []),
        ]"
        :key="'hbgo' + option.id"
        @click="setBackground(option.id)"
      >
        <div class="previewholder">
          <ShipCrewIcon
            :crewMember="{
              ...crewMember,
              background: option.url,
            }"
            :showDiscordIcon="false"
            :showTagline="false"
          />
        </div>
        <div class="martopsmall">
          {{ option.id }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {},
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
    currentTagline() {
      return this.crewMember?.tagline
    },
    currentBanner() {
      return this.crewMember?.background || 'default.svg'
    },
  },
  watch: {},
  mounted() {},
  methods: {
    setBackground(id: string | null) {
      ;(this as any).$socket?.emit(
        'crew:background',
        this.ship.id,
        this.crewMember?.id,
        id,
        (res: IOResponse<CrewMemberStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
          } else {
            this.$store.dispatch('notifications/notify', {
              text: 'Banner set!',
              type: 'success',
            })
          }
        },
      )
    },
    setTagline(tagline: string) {
      this.$store.commit('updateACrewMember', {
        id: this.crewMember.id,
        tagline,
      })
      ;(this as any).$socket?.emit(
        'crew:tagline',
        this.ship.id,
        this.crewMember?.id,
        tagline,
        (res: IOResponse<ShipStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
          } else {
            this.$store.dispatch('notifications/notify', {
              text: 'Tagline set!',
              type: 'success',
            })
          }
        },
      )
    },
  },
})
</script>

<style lang="scss" scoped>
.preview {
  padding: 1em;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  &.current {
    border: 1px solid rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.06);
  }

  .previewholder {
    border: 1px solid rgba(255, 255, 255, 0.1);
    width: 150px;
  }
}
</style>
