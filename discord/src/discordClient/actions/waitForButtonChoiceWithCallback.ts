import c from '../../../../common/dist'
import {
  Message,
  MessageOptions,
  MessageActionRow,
  MessageButton,
  MessageButtonOptions,
  MessageComponent,
  MessageComponentInteraction,
  MessageEmbed,
  ColorResolvable,
} from 'discord.js'
import { InteractionContext } from '../models/getInteractionContext'
import { APIMessage } from 'discord-api-types'

export default async function <ExpectedType extends string>({
  context,
  content,
  buttons,
  allowedUserId,
  callback,
}: {
  context: InteractionContext
  content: string | MessageEmbed[]
  buttons: MessageButtonOptions[]
  allowedUserId: string
  callback: (res: ExpectedType) => void
}): Promise<Message | APIMessage | null> {
  const rows: MessageActionRow[] = []
  for (let i = 0; i < buttons.length / 3; i++) rows.push(new MessageActionRow())
  for (let i = 0; i < buttons.length; i++)
    rows[Math.floor(i / 3)].addComponents([new MessageButton(buttons[i])])

  let didReply = false

  const sentMessage = await context.reply({
    embeds:
      typeof content === `string`
        ? [
            new MessageEmbed({
              description: content,
              color: c.gameColor as ColorResolvable,
            }),
          ]
        : content,
    components: rows,
  })
  if (!sentMessage) {
    c.log(`Failed to send message`)
    return null
  }
  const filter = (interaction: MessageComponentInteraction) =>
    interaction.member?.user.id === allowedUserId

  const collector = context.channel?.createMessageComponentCollector({
    filter,
    time: 5 * 60 * 1000, // 5 mins
  })
  if (!collector) {
    c.log(`Failed to create collector`)
    return null
  }

  collector.on?.(`collect`, async (i: MessageComponentInteraction) => {
    if (i.message.id !== sentMessage.id) return
    try {
      callback(i.customId as ExpectedType)
      i.deferUpdate()
      didReply = true
    } catch (e) {}
  })

  collector.on?.(`end`, () => {
    if (didReply) {
      try {
        if (`edit` in sentMessage)
          sentMessage.edit({ components: [] }).catch((e) => {})
        else context.editReply({ components: [] }).catch((e) => {})
      } catch (e) {}
    } else {
      try {
        if (`delete` in sentMessage) sentMessage.delete().catch((e) => {})
        else context.deleteReply()
      } catch (e) {}
    }
  })

  return sentMessage
}
