import c from '../../../../common/dist'
import {
  Message,
  MessageOptions,
  MessageActionRow,
  MessageButton,
  MessageButtonOptions,
  MessageComponent,
  MessageComponentInteraction,
} from 'discord.js'
import { CommandContext } from '../models/CommandContext'

export default async function <
  ExpectedType extends string,
>({
  context,
  content,
  buttons,
  allowedUserId,
  callback,
}: {
  context: CommandContext
  content: string
  buttons: MessageButtonOptions[]
  allowedUserId: string
  callback: (res: ExpectedType) => void
}): Promise<Message | null> {
  const rows: MessageActionRow[] = []
  for (let i = 0; i < buttons.length / 3; i++)
    rows.push(new MessageActionRow())
  for (let i = 0; i < buttons.length; i++)
    rows[Math.floor(i / 3)].addComponents([
      new MessageButton(buttons[i]),
    ])

  const sentMessage = await context.reply({
    content: content,
    components: rows,
  })
  if (!sentMessage || `error` in sentMessage) return null

  const filter = (
    interaction: MessageComponentInteraction,
  ) => interaction.member?.user.id === allowedUserId

  const collector =
    sentMessage.channel.createMessageComponentCollector({
      filter,
      time: 5 * 60 * 1000, // 5 mins
    })

  collector.on?.(
    `collect`,
    async (i: MessageComponentInteraction) => {
      if (i.message.id !== sentMessage.id) return
      try {
        callback(i.customId as ExpectedType)
        i.deferUpdate()
      } catch (e) {}
    },
  )

  collector.on?.(`end`, () => {
    try {
      sentMessage.edit({ components: [] }).catch((e) => {})
    } catch (e) {}
  })

  return sentMessage
}
