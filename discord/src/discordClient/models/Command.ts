import { Message } from 'discord.js'
import c from '../../../../common/dist'
import { CommandContext } from './CommandContext'

export interface Command {
  /**
   * list of aliases for the command.
   * The first name in the list is the primary command name.
   */
  readonly commandNames: string[]

  readonly requiresShip?: boolean
  readonly requiresCrewMember?: boolean
  readonly requiresCaptain?: boolean
  readonly requiresPlanet?: boolean
  readonly allowDm?: boolean

  /** usage documentation. */
  getHelpMessage(commandPrefix: string): string

  /** execute the command. */
  run(parsedUserCommand: CommandContext): Promise<void>

  /** returns true if the requesting user can use the command in the current context, or an error message otherwise. Returns an empty string to fail silently. */
  hasPermissionToRun?(
    parsedUserCommand: CommandContext,
  ): string | true

  ignorePrefixMatchTest?: (message: Message) => boolean
}
