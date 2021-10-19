<template>
  <div
    class="crewmemberdatabrowser"
    v-if="crewMembers.length"
  >
    <h5>Crew Member Data</h5>
    <div class="flex marbotsmall">
      <ModelSelect
        :options="
          crewMembers.map((s) => ({
            value: s.id,
            text: `${s.name} (${s.id})`,
          }))
        "
        v-model="selectedCrewMemberId"
        placeholder="Select crew member to inspect..."
      />
      <div class="buttonrow flex">
        <div
          class="button combo flexcenter marleftsmall"
          v-if="selectedCrewMemberId"
          @click="deleteCrewMember(selectedCrewMemberId)"
        >
          <div>Delete</div>
        </div>
      </div>
    </div>

    <div
      v-if="displayCrewMemberData"
      class="property flexstretch marbotsmall"
    >
      <input
        placeholder="Select property to search..."
        v-model="propertySearchTerm"
      />
      <div
        class="button flexcenter"
        v-if="propertySearchTerm"
        @click="propertySearchTerm = null"
      >
        <div>Clear</div>
      </div>
    </div>

    <div
      class="codeblock displaybox"
      :class="{ searching: propertySearchTerm }"
      v-html="filteredCrewMemberData"
    ></div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'
import { ModelSelect } from 'vue-search-select'
import 'vue-search-select/dist/VueSearchSelect.css'

export default Vue.extend({
  props: { text: { type: String } },
  components: { ModelSelect },
  data() {
    let displayCrewMemberData: any = null,
      filteredCrewMemberData: any = null,
      propertySearchTerm: string | undefined
    return {
      c,
      selectedCrewMemberId: undefined,
      propertySearchTerm,
      displayCrewMemberData,
      filteredCrewMemberData,
    }
  },
  computed: {
    ...mapState(['userId', 'adminPassword']),
    crewMembers(): CrewMemberStub[] {
      if (!this.text) return []
      return (
        (JSON.parse(this.text) as ShipStub).crewMembers ||
        []
      )
    },
  },
  watch: {
    selectedCrewMemberId(newId) {
      if (newId) {
        this.displayCrewMemberData = this.crewMembers.find(
          (cm) => cm.id === newId,
        )
        this.updateFilteredCrewMemberData()
      }
    },
    propertySearchTerm() {
      this.updateFilteredCrewMemberData()
    },
  },
  mounted() {},
  methods: {
    updateFilteredCrewMemberData() {
      if (!this.displayCrewMemberData) return
      if (!this.propertySearchTerm)
        this.filteredCrewMemberData = JSON.stringify(
          this.displayCrewMemberData,
          null,
          2,
        )
      else
        this.filteredCrewMemberData = JSON.stringify(
          this.displayCrewMemberData,
          null,
          2,
        )
          .split('\n')
          .map((line) =>
            line.includes(this.propertySearchTerm!)
              ? `<div class="highlight">${line}</div>`
              : `<span class="sub" style="opacity: ${
                  1 /
                  ((line.length - line.trim().length) / 3)
                }">${line.trim()}</span>`,
          )
          .join('')
    },

    async deleteCrewMember(crewMemberId: string) {
      if (
        !window.confirm(
          `Are you sure you want to DELETE ${crewMemberId}?`,
        )
      )
        return

      const shipId = (JSON.parse(this.text) as ShipStub).id
      ;(this as any).$socket?.emit(
        `admin:deleteCrewMember`,
        this.userId,
        this.adminPassword,
        shipId,
        crewMemberId,
      )
      this.$emit('reload')
    },
  },
})
</script>

<style lang="scss" scoped>
.crewmemberdatabrowser {
  width: 100%;

  .property {
    width: 100%;
    height: 2.5em;

    input {
      width: 100%;
      height: 100%;
      max-width: 100%;
    }
  }

  .displaybox {
    width: 100%;
    height: 50em;
    border: 1px solid var(--text);

    &.searching {
      line-height: 1.1;
    }
  }
}
</style>
