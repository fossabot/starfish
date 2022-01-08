<template>
  <div>
    <div class="flexbetween">
      <div class="sub">Level</div>
      <div>
        {{ data.level }}
        <span class="sub">(max {{ data.maxLevel }})</span>
      </div>
    </div>
    <div class="flexbetween">
      <div class="sub nowrap">Upgrades</div>
      <div class="textright">
        {{
          c.printList(
            data.upgradableProperties.map((p) =>
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
          success: data.upgradeBonus * (data.level - 1) > 0,
        }"
      >
        {{
          c.r2(data.upgradeBonus * (data.level - 1) * 100)
        }}% better
        <span class="sub"
          >(+{{ data.upgradeBonus * 100 }}%/level)</span
        >
      </div>
    </div>

    <hr />
    <div class="sub">Next Level Upgrade Cost</div>
    <div
      class="flex"
      v-for="req in data.upgradeRequirements"
      :key="data.id + req.research + req.cargoId"
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
                c.r2(req.current, req.cargoId ? 2 : 0)
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
          :numeric="true"
          v-tooltip="
            `Add ${
              c.cargo[req.cargoId].name
            } to the upgrade research for this ${
              data.displayName
            }`
          "
          @done="
            addResearchCargo(
              data,
              req.cargoId,
              ...arguments,
            )
          "
          @apply="
            addResearchCargo(
              data,
              req.cargoId,
              ...arguments,
            )
          "
        >
          <template #label>
            <span class="padlefttiny padrighttiny">+</span>
          </template>
          <template>
            How many tons of
            {{ c.cargo[req.cargoId].name }} will you put
            towards research?
          </template>
        </PromptButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: { data: {} },
  data() {
    return {
      c,
    }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
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
        amount = Math.min(
          (
            this.crewMember as CrewMemberStub
          ).inventory.find((i) => i.id === cargoId)
            ?.amount || 0,
          requirements.required - requirements.current,
        )
      amount = c.r2(parseFloat(`${amount}` || '0') || 0, 2)
      c.log(amount)
      if (
        !amount ||
        amount < 0 ||
        amount >
          Math.ceil(
            (requirements.required - requirements.current) *
              100,
          ) /
            100
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
            c.log(res.error)
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
            c.log(res.error)
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
