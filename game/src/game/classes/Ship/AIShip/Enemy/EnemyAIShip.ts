import c from '../../../../../../../common/dist'
import { Game } from '../../../../Game'
import { AIShip } from '../AIShip'
import type { CombatShip } from '../../CombatShip'
import type { Ship } from '../../Ship'
import type { Planet } from '../../../Planet/Planet'
import type { Cache } from '../../../Cache'
import type { Zone } from '../../../Zone'
import type { AttackRemnant } from '../../../AttackRemnant'
import type { Weapon } from '../../Item/Weapon'
import type { HumanShip } from '../../HumanShip/HumanShip'

import ais from './ais'

export class EnemyAIShip extends AIShip {
  scanTypes: ScanType[] = [`humanShip`]

  guildId: GuildId = `fowl`
  readonly speciesId: SpeciesId

  constructor(
    data: BaseAIShipData = {} as BaseAIShipData,
    game?: Game,
  ) {
    super(data, game)

    this.speciesId = data.speciesId || `chickens`
    this.guildId = data.guildId || `fowl`

    for (let prop of [
      `determineNewTargetLocation`,
      `determineTargetShip`,
      `scanTypes`,
      `updateSightAndScanRadius`,
      `headerBackground`,
      `addLevelAppropriateItems`,
    ]) {
      this[prop] =
        ais[this.speciesId]?.[prop] ||
        ais.default[prop] ||
        this[prop]
    }

    // tagline
    if (data.tagline === undefined) {
      const taglineOrGenerator =
        ais[this.speciesId]?.tagline || ais.default.tagline!
      if (typeof taglineOrGenerator === `function`)
        this.tagline = taglineOrGenerator()
      else this.tagline = taglineOrGenerator
    }

    if (data.onlyVisibleToShipId)
      this.onlyVisibleToShipId = data.onlyVisibleToShipId

    if (this.items.length === 0)
      this.addLevelAppropriateItems()
    if (this.weapons.length === 0)
      this.addItem({ itemType: `weapon`, itemId: `tiny1` })
    if (this.engines.length === 0)
      this.addItem({ itemType: `engine`, itemId: `tiny1` })

    this.updateSightAndScanRadius()
  }

  addLevelAppropriateItems() {
    // c.log(`Adding items to level ${this.level} ai...`)
    let itemBudget =
      this.level *
      (this.game?.settings.aiDifficultyMultiplier ||
        c.defaultGameSettings.aiDifficultyMultiplier)

    const validChassis = Object.values(c.items.chassis)
      .filter(
        (i: BaseChassisData) =>
          !i.special && i.rarity <= itemBudget / 3,
      )
      .sort(
        (a: BaseChassisData, b: BaseChassisData) =>
          b.rarity - a.rarity,
      )
    const chassisToBuy: BaseChassisData =
      validChassis[0] || c.items.chassis.ai1
    this.swapChassis(chassisToBuy)
    itemBudget = c.r2(itemBudget - chassisToBuy.rarity, 2)
    // c.log(
    //   `adding chassis ${chassisToBuy.displayName} with remaining budget of ${itemBudget}`,
    // )

    const isInBudget = (i: BaseItemData) =>
      i.rarity <= itemBudget
    const isSelectable = (i: BaseItemData) => !i.special

    while (true) {
      const typeToAdd: `engine` | `weapon` =
        this.weapons.length <= this.items.length / 2
          ? `weapon`
          : this.engines.length === 0
          ? `engine`
          : c.randomFromArray([`engine`, `weapon`])
      const itemPool = c.items[typeToAdd]
      const validItems: BaseItemData[] = Object.values(
        itemPool,
      )
        .filter(isInBudget)
        .filter(isSelectable)

      if (!validItems.length) break

      const itemToBuy: BaseItemData =
        c.randomFromArray(validItems)
      this.addItem(itemToBuy)
      itemBudget = c.r2(itemBudget - itemToBuy.rarity, 2)
      // c.log(
      //   `adding item ${itemToBuy.displayName} with remaining budget of ${itemBudget}`,
      // )

      if (this.slots <= this.items.length) break
    }
  }

  die(attacker?: CombatShip, silently?: boolean) {
    super.die(attacker)

    if (!silently) {
      let creditValue = Math.round(
        AIShip.dropCacheValueMultiplier * this.level,
      )

      if (attacker) {
        // apply "rarity boost" passive
        const rarityBoostPassive = (
          attacker.passives?.filter(
            (p) => p.id === `boostDropRarity`,
          ) || []
        ).reduce(
          (total: number, p: ShipPassiveEffect) =>
            total + (p.intensity || 0),
          0,
        )
        creditValue *= 1 + rarityBoostPassive
        // c.log(
        //  `ai drop rarity boosted by passive:`,
        //  rarityBoostPassive,
        // )
      }

      const cacheContents: CacheContents[] = []

      while (creditValue > 10) {
        // always a chance for credits
        if (Math.random() > 0.75) {
          let amount = Math.round(
            Math.min(
              Math.ceil(
                Math.random() + 0.3 * creditValue * 70,
              ) * 100,
              creditValue,
            ),
          )
          const existing = cacheContents.find(
            (cc) => cc.id === `credits`,
          )
          if (existing) existing.amount += amount
          else cacheContents.push({ id: `credits`, amount })
          creditValue -= amount
          continue
        }

        const cargoData = c.randomFromArray(
          Object.values(c.cargo),
        )

        const amount = c.r2(
          Math.min(
            creditValue /
              (cargoData.basePrice.credits || 100),
            c.r2(
              Math.random() * this.level * 4 + this.level,
            ),
          ),
          2,
          true,
        )
        const existing = cacheContents.find(
          (cc) => cc.id === cargoData.id,
        )
        if (existing)
          existing.amount = c.r2(existing.amount + amount)
        else
          cacheContents.push({ id: cargoData.id, amount })
        creditValue -=
          amount * (cargoData.basePrice.credits || 100)
      }
      // c.log(5000 * this.level, cacheContents)

      // * chance to add cosmetic currencies
      if (c.lottery(1, 500 / this.level)) {
        const amount = Math.random() > 0.8 ? 2 : 1
        cacheContents.push({
          id: `shipCosmeticCurrency`,
          amount,
        })
      }
      if (c.lottery(1, 500 / this.level)) {
        const amount = Math.round(
          (Math.random() + 0.1) * 1000,
        )
        cacheContents.push({
          id: `crewCosmeticCurrency`,
          amount,
        })
      }

      this.game?.addCache({
        contents: cacheContents,
        location: this.location,
        message: `Remains of ${this.name}`,
        onlyVisibleToShipId: this.onlyVisibleToShipId,
      })
    }
  }

  takeActionOnVisibleChange(
    previousVisible,
    currentVisible,
  ) {
    super.takeActionOnVisibleChange(
      previousVisible,
      currentVisible,
    )

    const newlyVisibleHumanShips =
      currentVisible.ships.filter(
        (s) =>
          s.human &&
          !s.planet &&
          !previousVisible.ships.includes(s),
      )
    newlyVisibleHumanShips.forEach((s: HumanShip) => {
      setTimeout(() => {
        this.broadcastTo(s)
      }, Math.random() * 5 * 60 * 1000) // sometime within 5 minutes
    })
  }

  async receiveBroadcast(
    message: string,
    from: Ship,
    garbleAmount: number,
    recipients: Ship[],
  ) {
    let oddsToIgnore = 0.99
    if (recipients.length === 1) oddsToIgnore *= 0.4
    if (
      message
        .toLowerCase()
        .indexOf(this.name.toLowerCase()) > -1
    )
      oddsToIgnore = 0.1
    if (Math.random() < oddsToIgnore) return

    // c.log(`ai ship ${this.name} received broadcast`)
    await c.sleep(Math.round(Math.random() * 1000 * 60))

    const textOptions = [
      `Less talk, more squawk!`,
      `The early bird gets the fish...`,
      `It's a bird! It's a plane! ...No, it's a bird.`,
      `I miss fresh air.`,
      `Do you really think you can out-fly us?`,
      `Some of my best friends are fish.`,
      `I hope you're more substantial than the last fish I fried!`,
      `Noisy fish make for good eating.`,
      `Talk all you want, it won't save you.`,
      `Would you pipe down over there?`,
      `Leave the singing to the birds`,
      `Don't get salty.`,
    ]
    // if (this.getStat('kills') > 1)
    // textOptions.push()
    const text = c.randomFromArray(textOptions)
    const garbled = c.garble(text, garbleAmount)
    const toSend = `${garbled.substring(
      0,
      c.maxBroadcastLength,
    )}`
    from.receiveBroadcast(toSend, this, garbleAmount, [
      from,
    ])
  }

  broadcastTo(ship: Ship) {
    // baseline chance to say nothing
    if (Math.random() > c.lerp(0.05, 0.3, this.level / 100))
      return

    const distance = c.distance(
      this.location,
      ship.location,
    )
    const maxBroadcastRadius = this.level * 0.04

    // don't message ships that are too far
    if (distance > maxBroadcastRadius) return
    // // don't message ships that are currently at a planet
    // if (ship.planet) return

    const distanceAsPercentOfMaxBroadcastRadius =
      distance / maxBroadcastRadius

    const garbleAmount =
      distanceAsPercentOfMaxBroadcastRadius
    let messageOptions = [
      `My, my, if it isn't a lovely snack!`,
      `Resistance is futile.`,
      `You look tasty.`,
      `Come closer, let's be friends!`,
      `Who ordered the fish filet?`,
      `Swim closer...`,
      `Hi, little fishy...`,
      `I think I smell something delicious!`,
      `I spy a fish!!`,
      `Come over this way, see what happens!`,
      `Get your gills over here!`,
      `It's been years since we had real fish!`,
      `Crack the shell. Get the meat.`,
      `Prepare to go belly-up.`,
      `Food sighted. Prepare to engage.`,
      `PREY SIGHTED! PREPARE FOR COMBA— Oops, wrong channel. Disregard.`,
    ]
    const message = c.garble(
      c.randomFromArray(messageOptions),
      garbleAmount,
    )
    ship.receiveBroadcast(message, this, garbleAmount, [
      ship,
    ])
  }
}
