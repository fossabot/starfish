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
}: {
  context: CommandContext
  content: string
  buttons: MessageButtonOptions[]
  allowedUserId: string
}): Promise<{
  result: ExpectedType | null
  sentMessage: Message
}> {
  const rows: MessageActionRow[] = []
  for (let i = 0; i < buttons.length / 4; i++)
    rows.push(new MessageActionRow())
  for (let i = 0; i < buttons.length; i++)
    rows[Math.floor(i / 4)].addComponents([
      new MessageButton(buttons[i]),
    ])

  const sentMessage =
    await context.initialMessage.channel.send({
      content: content,
      components: rows,
    })

  return new Promise((resolve) => {
    let done = false

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
        await i.deferUpdate()
        if (done) return
        done = true
        resolve({
          result: i.customId as ExpectedType,
          sentMessage,
        })
        collector.stop()
        sentMessage
          .edit({ components: [] })
          .catch((e) => {})
      },
    )
    collector.on?.(`end`, () => {
      if (done) return
      resolve({ result: null, sentMessage })
      sentMessage.edit({ components: [] }).catch((e) => {})
    })
  })
}
