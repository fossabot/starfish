import { ColorResolvable, EmbedFieldData, MessageEmbed } from 'discord.js'

import c from '../../../../common/dist'
import type { InteractionContext } from '../models/getInteractionContext'
import type { CommandStub } from '../models/Command'

const command: CommandStub = {
  requiresShip: true,

  commandNames: [`status`, `s`],

  getDescription(): string {
    return `See your and your ship's current status.`
  },

  async run(context: InteractionContext) {
    if (!context.ship) return
    const ship = context.ship

    const hasManualEngines = context.ship.items?.find(
      (i) =>
        i.itemType === `engine` && (i as EngineStub).manualThrustMultiplier,
    )

    let color = c.gameColor
    const hslColor = c.guilds[ship.guildId]?.color
    if (hslColor) {
      try {
        const [unused, h, s, l] =
          /hsl\((\d+),\s*(\d+[.]?\d*%)\s*,\s*(\d+[.]?\d*%)\)/g.exec(hslColor) ||
          []
        color = hslToHex(parseInt(h), parseInt(s), parseInt(l))
      } catch (e) {}
    }

    const fields: EmbedFieldData[] = []

    if (ship.planet)
      fields.push({
        name: `Planet`,
        value: `🪐` + ship.planet.name,
      })

    fields.push({
      name: `Ship HP`,
      value: `${c.percentToTextBars(
        (ship._hp || 0) / (ship._maxHp || 0),
        (ship._maxHp || 0) * 2,
      )}
🇨🇭 ${c.abbreviateNumber(
        (ship._hp || 0) * c.displayHPMultiplier,
        1,
      )}/${c.abbreviateNumber((ship._maxHp || 0) * c.displayHPMultiplier)}`,
    })

    if (ship.items)
      for (let i of ship.items) {
        fields.push({
          inline: true,
          name: c.items[i.itemType][i.itemId].displayName,
          value: `(${c.capitalize(i.itemType)})
${c.percentToTextBars(
  ((i.repair || 0) * c.items[i.itemType][i.itemId].maxHp) /
    c.items[i.itemType][i.itemId].maxHp,
  c.items[i.itemType][i.itemId].maxHp * 2,
)}
🇨🇭 ${c.abbreviateNumber(
            (i.repair || 0) *
              c.items[i.itemType][i.itemId].maxHp *
              c.displayHPMultiplier,
          )}/${c.abbreviateNumber(
            c.items[i.itemType][i.itemId].maxHp * c.displayHPMultiplier,
          )}`,
        })
      }

    const embeds: MessageEmbed[] = [
      new MessageEmbed({
        title: `${ship.name}`,
        color: color as ColorResolvable,
        description:
          `**` +
          (ship.speed
            ? `${c.speedNumber(ship.speed * 60 * 60)} ${
                ship.direction
                  ? `at ${c.degreesToArrowEmoji(ship.direction)}${c.r2(
                      ship.direction,
                      2,
                    )}°`
                  : ``
              }`
            : `Stopped`) +
          `**`,
        fields,
      }),
    ]

    if (context.crewMember) {
      const youFields: EmbedFieldData[] = []
      if (context.crewMember) {
        youFields.push({
          inline: true,
          name: `Location`,
          value: `🚪 ${c.capitalize(context.crewMember.location || `bunk`)}`,
        })
        youFields.push({
          inline: true,
          name: `Stamina`,
          value: `${c.percentToTextBars(context.crewMember.stamina)}
🔋 ${c.r2(
            (context.crewMember.stamina /
              (context.crewMember.maxStamina || 1)) *
              100,
            0,
          )}%`,
        })
        if (hasManualEngines)
          youFields.push({
            inline: true,
            name: `Cockpit Charge`,
            value: `${c.percentToTextBars(context.crewMember.cockpitCharge)}
🔥 ${c.r2(context.crewMember.cockpitCharge * 100, 0)}%`,
          })
        youFields.push({
          inline: true,
          name: c.capitalize(c.baseCurrencyPlural),
          value: `💳 ${c.numberWithCommas(
            c.r2(context.crewMember.credits, 0),
          )}`,
        })
        // if (context.crewMember.crewCosmeticCurrency)
        // youFields.push({
        //   inline: true,
        //   name: c.capitalize(c.crewCosmeticCurrencyPlural),
        //   value: `🟡 ${c.numberWithCommas(
        //     c.r2(context.crewMember.credits, 0),
        //   )}`,
        // })
        youFields.push({
          inline: true,
          name: `Inventory`,
          value:
            `${c.percentToTextBars(
              context.crewMember.inventory.reduce(
                (total, i) => total + i.amount,
                0,
              ) /
                Math.min(
                  context.crewMember.maxCargoSpace,
                  ship.chassis?.maxCargoSpace || 0,
                ),
            )}
📦 ${c.r2(
              context.crewMember.inventory.reduce(
                (total, i) => total + i.amount,
                0,
              ),
            )}/${Math.min(
              context.crewMember.maxCargoSpace,
              ship.chassis?.maxCargoSpace || 0,
            )} tons` +
            (context.crewMember.inventory.filter((i) => i.amount).length === 0
              ? ``
              : `\n${context.crewMember.inventory
                  .filter((i) => i.amount)
                  .map(
                    (i) =>
                      `${c.cargo[i.id].name} (${c.r2(i.amount)} ton${
                        i.amount === 1 ? `` : `s`
                      })`,
                  )
                  .join(`\n`)}`),
        })
      }

      embeds.push(
        new MessageEmbed({
          title: `${
            (context.crewMember.speciesId &&
              c.species[context.crewMember.speciesId].icon + ` `) ||
            ``
          }${context.crewMember.name}`,
          color: color as ColorResolvable,
          fields: youFields,
        }),
      )
    }

    context.reply({
      embeds,
    })
  },
}

export default command

function hslToHex(h, s, l) {
  l /= 100
  const a = (s * Math.min(l, 1 - l)) / 100
  const f = (n) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, `0`) // convert to Hex and prefix "0" if needed
  }
  return `#${f(0)}${f(8)}${f(4)}`
}
