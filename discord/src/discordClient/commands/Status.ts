import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import {
  ColorResolvable,
  EmbedField,
  EmbedFieldData,
  MessageEmbed,
} from 'discord.js'

export class StatusCommand implements Command {
  commandNames = [
    `status`,
    `s`,
    `vitals`,
    `ship`,
    `shipinfo`,
  ]

  getHelpMessage(
    commandPrefix: string,
    availableRooms?: string[],
  ): string {
    return `Use \`${commandPrefix}${this.commandNames[0]}\` to apply the brakes with all of your current available charge.`
  }

  async run(context: CommandContext) {
    if (!context.ship) return
    const ship = context.ship

    // <div>
    //       {{
    //         c.r2(dataToUse && dataToUse.speed * 60 * 60, 4)
    //       }}
    //       AU/hr
    //       <br />
    //       at
    //       {{ c.r2(dataToUse && dataToUse.direction, 2) }}°
    //     </div>

    const color = c.factions[ship.faction.id].name
      .split(` `)[0]
      ?.toUpperCase()

    const fields: EmbedFieldData[] = []

    fields.push({
      name: `Ship HP`,
      value: `${c.percentToTextBars(
        (ship._hp || 0) / (ship._maxHp || 0),
        20,
      )}
${c.r2(ship._hp || 0)}/${c.r2(ship._maxHp || 0)}`,
    })

    if (ship.items)
      for (let i of ship.items) {
        fields.push({
          inline: true,
          name: c.items[i.type][i.id].displayName,
          value: `(${c.capitalize(i.type)})
${c.percentToTextBars(
  ((i.repair || 0) * c.items[i.type][i.id].maxHp) /
    c.items[i.type][i.id].maxHp,
)}
${c.r2((i.repair || 0) * c.items[i.type][i.id].maxHp)}/${
            c.items[i.type][i.id].maxHp
          } HP`,
        })
      }

    const embeds: MessageEmbed[] = [
      new MessageEmbed({
        title: ship.name,
        color: color as ColorResolvable,
        description: ship.speed
          ? `${c.r2(ship.speed * 60 * 60, 4)} AU/hr ${
              ship.direction
                ? `at ${c.degreesToArrowEmoji(
                    ship.direction,
                  )}${c.r2(ship.direction, 2)}°`
                : ``
            }`
          : `Stopped`,
        fields,
      }),
    ]

    if (context.crewMember) {
      const youFields: EmbedFieldData[] = []
      if (context.crewMember) {
        youFields.push({
          inline: true,
          name: `Location`,
          value: `${c.capitalize(
            context.crewMember.location || `bunk`,
          )}`,
        })
        youFields.push({
          inline: true,
          name: `Stamina`,
          value: `${c.percentToTextBars(
            context.crewMember.stamina,
          )}
${c.r2(context.crewMember.stamina * 100, 0)}%`,
        })
        youFields.push({
          inline: true,
          name: `Cockpit Charge`,
          value: `${c.percentToTextBars(
            context.crewMember.cockpitCharge,
          )}
${c.r2(context.crewMember.cockpitCharge * 100, 0)}%`,
        })
        youFields.push({
          inline: true,
          name: `Credits`,
          value: `${c.numberWithCommas(
            c.r2(context.crewMember.credits, 0),
          )}`,
        })
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
${c.r2(
  context.crewMember.inventory.reduce(
    (total, i) => total + i.amount,
    0,
  ),
)}/${Math.min(
              context.crewMember.maxCargoSpace,
              ship.chassis?.maxCargoSpace || 0,
            )} tons` +
            (context.crewMember.inventory.length === 0
              ? ``
              : `\n${context.crewMember.inventory
                  .map(
                    (i) =>
                      `${c.cargo[i.id].name} (${
                        i.amount
                      } ton${i.amount === 1 ? `` : `s`})`,
                  )
                  .join(`\n`)}`),
        })
      }

      embeds.push(
        new MessageEmbed({
          title: context.crewMember.name,
          color: color as ColorResolvable,
          fields: youFields,
        }),
      )
    }

    context.reply({
      embeds,
    })
  }

  hasPermissionToRun(
    commandContext: CommandContext,
  ): string | true {
    if (!commandContext.ship)
      return `Your server doesn't have a ship yet! Use \`${commandContext.commandPrefix}start\` to start your server off in the game.`
    return true
  }
}
