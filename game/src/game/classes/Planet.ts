import c from '../../../../common/dist'

import type { Game } from '../Game'
import type { Faction } from './Faction'

import { data as cargoData } from '../presets/cargo'
import { data as passiveData } from '../presets/crewPassives'
import { data as activeData } from '../presets/crewActives'
import { chassis as chassisData } from '../presets/items/chassis'
import * as itemData from '../presets/items/'

export class Planet {
  static readonly fluctuatorIntensity = 0.2

  readonly name: string
  readonly color: string
  readonly location: CoordinatePair
  readonly game: Game
  readonly vendor: Vendor
  readonly faction?: Faction
  readonly creatures: string[]
  readonly repairCostMultiplier: number
  readonly radius: number
  readonly homeworld?: Faction
  mass = 5.974e30
  buyFluctuator = 1
  sellFluctuator = 1

  constructor(
    {
      name,
      color,
      location,
      vendor,
      factionId,
      homeworld,
      creatures,
      repairCostMultiplier,
      radius,
    }: BasePlanetData,
    game: Game,
  ) {
    this.game = game
    this.name = name
    this.color = color
    this.location = location
    this.radius = radius
    this.creatures = creatures || []
    this.repairCostMultiplier = repairCostMultiplier || 0
    this.homeworld = game.factions.find(
      (f) => f.id === homeworld?.id,
    )
    this.faction =
      this.homeworld ||
      game.factions.find((f) => f.id === factionId)

    this.vendor = {
      cargo: vendor.cargo?.map((cargo) => {
        return {
          sellMultiplier: cargo.sellMultiplier,
          buyMultiplier: cargo.buyMultiplier,
          cargoType: cargo.cargoType,
          cargoData: cargoData[cargo.cargoType],
        } as VendorCargoPrice
      }),
      passives: vendor.passives?.map((passive) => {
        return {
          buyMultiplier: passive.buyMultiplier,
          passiveType: passive.passiveType,
          passiveData: passiveData[passive.passiveType],
        } as VendorCrewPassivePrice
      }),
      chassis: vendor.chassis?.map((chassis) => {
        return {
          buyMultiplier: chassis.buyMultiplier,
          sellMultiplier: chassis.sellMultiplier,
          chassisType: chassis.chassisType,
          chassisData: chassisData[chassis.chassisType],
        } as VendorChassisPrice
      }),
      actives: vendor.actives?.map((active) => {
        return {
          buyMultiplier: active.buyMultiplier,
          activeType: active.activeType,
          activeData: activeData[active.activeType],
        } as VendorCrewActivePrice
      }),
      items: vendor.items
        ?.map((item) => {
          return {
            buyMultiplier: item.buyMultiplier,
            sellMultiplier: item.sellMultiplier,
            itemType: item.itemType,
            itemId: item.itemId,
            itemData: (itemData[item.itemType] as any)[
              item.itemId
            ],
          } as VendorItemPrice
        })
        .filter((i) => i.itemData),
    }

    this.mass =
      ((5.974e30 * this.radius) / 36000) *
      (1 + Math.random() * 0.1)

    this.updateFluctuators()
    setInterval(this.updateFluctuators, 1000 * 60 * 60) // every hour
  }

  identify() {
    c.log(
      `Planet: ${this.name} (${this.color}) at ${this.location}`,
    )
  }

  shipsAt() {
    return this.game.humanShips.filter(
      (s) => s.planet === this,
    )
  }

  updateFluctuators() {
    const intensity = Planet.fluctuatorIntensity
    const mod = (this.name || ``)
      .split(``)
      .reduce((t, c) => t + c.charCodeAt(0), 0)

    this.buyFluctuator =
      (((new Date().getDate() * 13 +
        mod +
        (new Date().getMonth() * 7 + mod)) %
        100) /
        100) *
        intensity +
      (1 - intensity / 2)

    this.sellFluctuator =
      (((new Date().getDate() * 13 +
        15 +
        mod +
        (new Date().getMonth() * 9 + 3 + mod)) %
        100) /
        100) *
        intensity +
      (1 - intensity / 2)
  }
}
