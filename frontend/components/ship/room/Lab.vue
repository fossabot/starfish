<template>
  <Box
    class="research"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/24.webp"
  >
    <template #title
      ><span class="sectionemoji">🔬</span>Research
      Lab</template
    >

    <div class="panesection">
      <div class="">
        Your research speed:
        {{
          c.numberWithCommas(
            c.r2(
              (researchPerTick / c.tickInterval) *
                1000 *
                60 *
                60,
              0,
            ),
          )
        }}/hr
      </div>
      <div class="sub" v-if="upgradableItems.length > 1">
        Select your research focus below.
      </div>
    </div>

    <div class="panesection">
      <div
        class="panesubhead"
        v-if="upgradableItems.length"
      >
        Available Research ({{ upgradableItems.length }})
      </div>

      <div v-if="upgradableItems.length === 0">
        <div class="mar textcenter sub">
          No research available.
        </div>
      </div>
      <div v-else>
        <Tabs
          :dropdown="true"
          :noPad="true"
          class="nopad"
          :bigTabs="true"
          :preSelect="
            upgradableItems.findIndex(
              (i) => i.id === crewMember.researchTargetId,
            )
          "
          @input="setResearchTargetId"
        >
          <Tab
            v-for="item in upgradableItems"
            :key="item.id"
            :title="`Upgrade ${item.displayName} (Lv. ${item.level})`"
            :inputKey="item.id"
          >
            <div class="flexbetween padtopsmall">
              <div class="sub">Level</div>
              <div>
                {{ item.level }}
                <span class="sub"
                  >(max {{ item.maxLevel }})</span
                >
              </div>
            </div>
            <div class="flexbetween">
              <div class="sub nowrap">Upgrades</div>
              <div class="textright">
                {{
                  c.printList(
                    item.upgradableProperties.map((p) =>
                      c.capitalize(
                        c.camelCaseToWords(
                          p.replace('Multiplier', ''),
                        ),
                      ),
                    ),
                  )
                }}
              </div>
            </div>
            <div class="flexbetween">
              <div class="sub nowrap">Current Bonus</div>
              <div
                class="textright"
                :class="{
                  success:
                    item.upgradeBonus * (item.level - 1) >
                    0,
                }"
              >
                {{
                  item.upgradeBonus *
                  (item.level - 1) *
                  100
                }}% better
                <span class="sub"
                  >(+{{
                    item.upgradeBonus * 100
                  }}%/level)</span
                >
              </div>
            </div>

            <hr />
            <div class="sub">Next Level Upgrade Cost</div>
            <div
              class="flex"
              v-for="req in item.upgradeRequirements"
              :key="
                item.id +
                req.current +
                req.required +
                req.cargoType
              "
            >
              <ProgressBar
                :mini="true"
                :dangerZone="-1"
                :percent="req.current / req.required"
                :color="
                  req.current === req.required
                    ? 'var(--success)'
                    : undefined
                "
              >
                <div class="flexbetween fullwidth">
                  <div class="bold">
                    <span v-if="req.research">Research</span
                    ><span v-if="req.cargoId">{{
                      c.capitalize(req.cargoId)
                    }}</span>
                  </div>
                  <div>
                    <NumberChangeHighlighter
                      :number="
                        c.r2(
                          req.current,
                          req.cargoId ? 2 : 0,
                        )
                      "
                    />
                    <span
                      class="sub"
                      v-if="req.current < req.required"
                    >
                      /
                      {{ c.numberWithCommas(req.required) }}
                    </span>
                    <span class="sub" v-if="req.cargoId">
                      tons
                    </span>
                    <span
                      v-if="req.current === req.required"
                      style="position: relative; top: 1px"
                    >
                      ✅
                    </span>
                  </div>
                </div>
              </ProgressBar>

              <div
                class="marleftsmall"
                v-if="
                  req.cargoId &&
                  c.cargo[req.cargoId] &&
                  req.current < req.required
                "
              >
                <PromptButton
                  :disabled="
                    !crewMember.inventory.find(
                      (ca) => ca.id === req.cargoId,
                    ) ||
                    crewMember.inventory.find(
                      (ca) => ca.id === req.cargoId,
                    ).amount < 0.01
                  "
                  :max="
                    Math.min(
                      (crewMember.inventory.find(
                        (ca) => ca.id === req.cargoId,
                      ) &&
                        crewMember.inventory.find(
                          (ca) => ca.id === req.cargoId,
                        ).amount) ||
                        0,
                      req.required - req.current,
                    )
                  "
                  v-tooltip="
                    `Add ${
                      c.cargo[req.cargoId].name
                    } to the upgrade research for this ${
                      item.displayName
                    }`
                  "
                  @done="
                    addResearchCargo(
                      item,
                      req.cargoId,
                      ...arguments,
                    )
                  "
                  @apply="
                    addResearchCargo(
                      item,
                      req.cargoId,
                      ...arguments,
                    )
                  "
                >
                  <template #label>
                    <span class="padlefttiny padrighttiny"
                      >+</span
                    >
                  </template>
                  <template>
                    How many tons of
                    {{ c.cargo[req.cargoId].name }} will you
                    put towards research?
                  </template>
                </PromptButton>
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return {
      c,
    }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
    highlight(): boolean {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'research'
      )
    },
    upgradableItems(): ItemStub[] {
      return (this.ship?.items ?? []).filter(
        (i: ItemStub) => i.upgradable,
      )
    },
    // choicesToShow(): MinePriorityType[] {
    //   const choices: MinePriorityType[] = [
    //     ...(
    //       (this.ship?.planet?.mine || []) as PlanetMine
    //     ).map((m) => m.id),
    //     'closest',
    //   ]
    //   return choices
    // },
    // selected(): string {
    //   const priority = this.crewMember?.minePriority
    //   return this.choicesToShow.includes(priority)
    //     ? priority
    //     : 'closest'
    // },
    researchPerTick(): number {
      const passiveBoostMultiplier = 1
      // +
      // ((
      //   this.crewMember as CrewMemberStub
      // ).passives?.reduce(
      //   (total, p: CrewPassiveData) =>
      //     p.id === 'boostMineSpeed'
      //       ? total + (p.intensity || 0)
      //       : total,
      //   0,
      // ) || 0) +
      // ((this.ship as ShipStub).passives?.reduce(
      //   (total, p: ShipPassiveEffect) =>
      //     p.id === 'boostMineSpeed'
      //       ? total + (p.intensity || 0)
      //       : total,
      //   0,
      // ) || 0)
      const generalBoostMultiplier =
        c.getGeneralMultiplierBasedOnCrewMemberProximity(
          this.crewMember,
          this.ship.crewMembers,
        )
      return (
        generalBoostMultiplier *
        passiveBoostMultiplier *
        c.getResearchAmountPerTickForSingleCrewMember(
          this.crewMember?.skills.find(
            (s: XPData) => s.skill === 'intellect',
          )?.level || 1,
        )
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {
    addResearchCargo(
      item: ItemStub,
      cargoId: CargoId,
      amount: number | 'all',
    ) {
      const requirements = item.upgradeRequirements?.find(
        (r) => r.cargoId === cargoId,
      )
      if (!requirements) return

      if (amount === 'all')
        amount =
          requirements.required - requirements.current
      amount = c.r2(
        parseFloat(`${amount}` || '0') || 0,
        2,
        true,
      )
      if (
        !amount ||
        amount < 0 ||
        amount >
          requirements.required - requirements.current
      ) {
        this.$store.dispatch('notifications/notify', {
          text: 'Invalid amount.',
          type: 'error',
        })
        return
      }

      ;(this as any).$socket?.emit(
        'crew:applyCargoToResearch',
        this.ship.id,
        this.crewMember.id,
        'item',
        item.id,
        cargoId,
        amount,
        (res: IOResponse<true>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
            return
          }
          this.$store.dispatch('notifications/notify', {
            text: `Put ${c.r2(amount as number)} ton${
              amount === 1 ? '' : 's'
            } of ${cargoId} towards research.`,
            type: 'success',
          })
        },
      )
    },
    setResearchTargetId(targetId: string) {
      if (targetId === this.crewMember.researchTargetId)
        return
      ;(this as any).$socket?.emit(
        'crew:researchTargetId',
        this.ship.id,
        this.crewMember.id,
        targetId,
        (res: IOResponse<true>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
            return
          }
        },
      )
    },
  },
})
</script>

<style lang="scss" scoped>
.research {
  position: relative;
  width: 320px;
}
</style>
