import c from '../../../../../common/dist'
import { Message } from 'discord.js'

/** A user-given command extracted from a message. */
export class CommandContext {
  /** Command name in all lowercase. */
  readonly commandName: string

  /** Arguments (split by space). */
  readonly args: string[]

  /** Original Message the command was extracted from. */
  readonly initialMessage: Message

  readonly commandPrefix: string

  readonly dm: boolean

  ship: ShipStub | null = null

  crewMember: CrewMemberStub | null = null

  readonly gameAdmin: boolean

  constructor(message: Message, prefix: string) {
    this.commandPrefix = prefix
    const splitMessage = message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/g)

    this.commandName = splitMessage.shift()!.toLowerCase()
    this.args = splitMessage
    this.initialMessage = message
    this.dm = message.channel.type === 'dm'
    this.gameAdmin = [
      '244651135984467968',
      '395634705120100367',
    ].includes(message.author.id)
  }
}
