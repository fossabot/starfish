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
} from 'discord.js'
import { InteractionContext } from '../models/getInteractionContext'
import { APIMessage } from 'discord-api-types'

export default async function <ExpectedType extends string>({
  context,
  content,
  buttons,
  allowedUserId,
}: {
  context: InteractionContext
  content: string | MessageEmbed[]
  buttons: MessageButtonOptions[]
  allowedUserId: string
}): Promise<{
  result: ExpectedType | null
  sentMessage: Message | APIMessage | null
}> {
  const rows: MessageActionRow[] = []
  for (let i = 0; i < buttons.length / 3; i++) rows.push(new MessageActionRow())
  for (let i = 0; i < buttons.length; i++)
    rows[Math.floor(i / 3)].addComponents([new MessageButton(buttons[i])])

  const sentMessage = await context.reply({
    content: typeof content === `string` ? content : undefined,
    embeds: typeof content === `string` ? undefined : content,
    components: rows,
  })
  if (!sentMessage || `error` in sentMessage)
    return { result: null, sentMessage: null }

  return new Promise((resolve) => {
    let done = false

    const filter = (interaction: MessageComponentInteraction) =>
      interaction.member?.user.id === allowedUserId

    const collector = context.channel?.createMessageComponentCollector({
      filter,
      time: 5 * 60 * 1000, // 5 mins
    })
    if (!collector) {
      resolve({ result: null, sentMessage })
      return
    }

    collector.on?.(`collect`, async (i: MessageComponentInteraction) => {
      if (i.message.id !== sentMessage.id) return
      try {
        await i.deferUpdate()
        if (done) return
        done = true
        resolve({
          result: i.customId as ExpectedType,
          sentMessage,
        })
        collector.stop()
        if (`edit` in sentMessage)
          sentMessage.edit({ components: [] }).catch((e) => {})
        else context.editReply({ components: [] })
      } catch (e) {}
    })
    collector.on?.(`end`, () => {
      if (done) return
      resolve({ result: null, sentMessage })
      if (`edit` in sentMessage)
        sentMessage.edit({ components: [] }).catch((e) => {})
      else context.editReply({ components: [] })
    })
  })
}
