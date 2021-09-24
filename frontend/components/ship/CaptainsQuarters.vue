<template>
  <Box
    class="captainsquarters"
    v-if="show"
    bgImage="/images/paneBackgrounds/20.jpg"
  >
    <template #title>
      <span class="sectionemoji">👑</span>Captain's Decree
    </template>

    <div class="panesection" v-if="validOrders">
      <div>
        "<span>{{ validOrders.verb }}</span
        ><span
          v-if="validOrders.target"
          v-tooltip="validOrders.target"
          :style="{ color: validOrders.target.color }"
        >
          {{ validOrders.target.icon || ''
          }}{{
            validOrders.target.name ||
            validOrders.target.displayName
          }}</span
        ><span v-if="validOrders.addendum"
          >, {{ validOrders.addendum }}</span
        ><span v-else>!</span>"

        <div class="sub martopsmall">
          - {{ captain.name }}
        </div>
      </div>
    </div>

    <div
      class="panesection"
      v-if="isCaptain && ship.visible"
    >
      <div class="panesubhead">Set new orders</div>
      <select v-model="orders.verb">
        <option value="">Select a verb...</option>
        <option value="Go to">Go to</option>
        <option
          value="Attack"
          v-if="
            ship.visible.ships.filter(
              (s) => s.faction.id !== ship.faction.id,
            ).length
          "
        >
          Attack
        </option>
        <option
          value="Get"
          v-if="ship.visible.caches.length"
        >
          Get
        </option>
        <option
          value="Help"
          v-if="ship.visible.ships.length"
        >
          Help
        </option>
        <option
          value="Mine at"
          v-if="ship.seenPlanets.find((p) => p.mine)"
        >
          Mine
        </option>
        <option value="Rest up">Rest</option>
        <option
          value="Repair"
          v-if="
            ship.items.filter((i) => i.repair < 0.95).length
          "
        >
          Repair
        </option>
        <option value="">(none)</option>
      </select>

      <select
        v-model="orders.target"
        v-if="['Attack'].includes(orders.verb)"
      >
        <option value="">Select a ship...</option>
        <option
          v-for="s in ship.visible.ships.filter(
            (vs) => vs.faction.id !== ship.faction.id,
          )"
          :key="'cqo' + s.id"
          :value="{ type: 'ship', id: s.id, name: s.name }"
        >
          {{ c.species[s.species.id].icon }}{{ s.name }}
        </option>
      </select>

      <select
        v-model="orders.target"
        v-if="['Help'].includes(orders.verb)"
      >
        <option value="">Select a ship...</option>
        <option
          v-for="s in ship.visible.ships.filter(
            (vs) => vs.id !== ship.id,
          )"
          :key="'cqo' + s.id"
          :value="{ type: 'ship', id: s.id, name: s.name }"
        >
          {{ c.species[s.species.id].icon }}{{ s.name }}
        </option>
      </select>

      <select
        v-model="orders.target"
        v-if="['Get'].includes(orders.verb)"
      >
        <option value="">Select a cache...</option>
        <option
          v-for="s in ship.visible.caches"
          :key="'cqo' + s.id"
          :value="{ type: 'cache', id: s.id, name: s.name }"
        >
          📦Cache (<AngleArrow
            :angle="
              c.angleFromAToB(ship.location, s.location)
            "
          />
          {{
            c.r2(c.distance(ship.location, s.location))
          }}AU)
        </option>
      </select>

      <select
        v-model="orders.target"
        v-if="['Mine at'].includes(orders.verb)"
      >
        <option value="">Select a planet...</option>
        <option
          v-for="s in ship.seenPlanets.filter(
            (p) => p.mine,
          )"
          :key="'cqo' + (s.id || s.name)"
          :value="{
            type: 'planet',
            name: s.name,
          }"
        >
          🪐{{ s.name }}
        </option>
      </select>

      <select
        v-model="orders.target"
        v-if="['Go to'].includes(orders.verb)"
      >
        <option value="">Select a destination...</option>
        <option
          v-for="s in [
            ...ship.seenPlanets,
            ...ship.seenLandmarks,
            ...ship.visible.ships.filter(
              (vs) => vs.id !== ship.id,
            ),
            ...ship.visible.caches,
          ]"
          :key="'cqo' + (s.id || s.name)"
          :value="{
            type: s.type || 'ship',
            id: s.id,
            name: s.name,
          }"
        >
          {{
            s.species
              ? c.species[s.species.id].icon
              : s.type === 'planet'
              ? '🪐'
              : s.type === 'cache'
              ? '📦'
              : s.type === 'zone'
              ? '⭕'
              : ''
          }}{{ s.name }}
        </option>
      </select>

      <select
        v-model="orders.target"
        v-if="['Repair'].includes(orders.verb)"
      >
        <option value="">Select equipment...</option>
        <option
          v-for="s in ship.items.filter(
            (i) => i.repair < 0.95,
          )"
          :key="'cqo' + s.type + s.id"
          :value="{
            type: s.type,
            id: s.id,
            name: s.displayName,
          }"
        >
          {{ s.displayName }} ({{ c.capitalize(s.type) }})
        </option>
        <option value="">Anything</option>
      </select>

      <select v-model="orders.addendum" v-if="orders.verb">
        <option value="">Select an addendum...</option>
        <option value="quickly!">Quickly!</option>
        <option value="but no rush.">No rush.</option>
        <option value="all together now!">
          All together, now!
        </option>
        <option value="or else!">Or else!</option>
        <option value="I dare you.">I dare you.</option>
        <option value="please 🙂">Please 🙂</option>
        <option
          :value="`my fellow ${
            c.species[ship.species.id].id
          }!`"
        >
          Fellow {{ c.species[ship.species.id].id }}!
        </option>
        <option value="if you know what I mean 😉">
          IFKWIM 😉
        </option>
        <option value="">(none)</option>
      </select>

      <div class="martop flexbetween">
        <button
          v-if="toValidOrders(orders)"
          @click="setOrders"
        >
          Set Orders
        </button>
        <div v-else></div>
        <button
          class="secondary"
          v-if="validOrders"
          @click="setOrders(true)"
        >
          Clear Orders
        </button>
      </div>

      <div class="martop sub">Only you can set orders.</div>
    </div>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    const orders: ShipOrders = {
      verb: '',
      target: '' as any,
      addendum: '',
    }
    return {
      c,
      orders,
    }
  },
  computed: {
    ...mapState(['ship', 'userId', 'crewMember']),
    show(): boolean {
      return (
        this.ship &&
        this.captain &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes(
            'captainsquarters',
          )) &&
        (this.isCaptain || this.validOrders)
      )
    },
    captain(): CrewMemberStub | undefined {
      return this.ship?.crewMembers.find(
        (cm) => cm.id === this.ship?.captain,
      )
    },
    isCaptain(): boolean {
      return this.captain?.id === this.userId
    },
    validOrders(): false | ShipOrders {
      return this.toValidOrders(this.ship.orders)
    },
  },
  watch: {},
  mounted() {},
  methods: {
    setOrders(clear = false): void {
      ;(this as any).$socket?.emit(
        'ship:orders',
        this.ship.id,
        this.crewMember?.id,
        clear === true ? null : (this as any).orders,
        (res: IOResponse<CrewMemberStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
            return
          }
          this.$store.dispatch('notifications/notify', {
            text: `New orders set!`,
            type: 'success',
          })
        },
      )
    },

    toValidOrders(orders: ShipOrders): false | ShipOrders {
      if (!orders || !this.ship) return false
      const o = { ...orders }
      if (!o.verb) return false
      if (
        [
          'Go to',
          'Attack',
          'Get',
          'Help',
          'Mine at',
        ].includes(o.verb) &&
        !o.target
      )
        return false

      if (!o.target) return orders

      const itemTypes: ItemType[] = [
        'weapon',
        'engine',
        'scanner',
        'communicator',
        'armor',
      ]
      if (o.target.type === 'planet') {
        const found = this.ship.seenPlanets.find(
          (s) => s.name === o.target!.name,
        )
        if (!found) return false
        o.target = found
        o.target!.icon = `🪐`
      } else if (o.target!.type === 'zone') {
        const found = this.ship.seenLandmarks.find(
          (s) => s.type === 'zone' && s.id === o.target!.id,
        )
        if (!found) return false
        o.target = found
        o.target!.icon = `⭕`
      } else if (o.target!.type === 'ship') {
        const found = this.ship.visible?.ships.find(
          (s) => s.id === o.target!.id,
        )
        if (!found) return false
        o.target = found
        o.target!.icon = c.species[found.species.id].icon
        o.target!.color = c.factions[found.faction.id].color
        o.target!.type = 'ship'
      } else if (o.target!.type === 'cache') {
        const found = this.ship.visible?.caches.find(
          (s) => s.id === o.target!.id,
        )
        if (!found) return false
        o.target = found
        o.target!.angle = c.angleFromAToB(
          this.ship.location,
          found.location,
        )
        o.target!.distance = c.distance(
          this.ship.location,
          found.location,
        )
        o.target!.color = `var(--cache)`
      } else if (
        itemTypes.includes(o.target!.type as any)
      ) {
        const found = this.ship.items.find(
          (i) =>
            i.id === o.target!.id &&
            i.type === o.target!.type,
        )
        if (!found) return false
        if (found.repair > 0.95) return false
        o.target = found
        o.target!.color = `var(--item)`
      }

      return o
    },
  },
})
</script>

<style lang="scss" scoped>
.captainsquarters {
  width: 250px;
}
</style>
