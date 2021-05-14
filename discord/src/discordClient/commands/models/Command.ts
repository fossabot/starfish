import { CommandContext } from './CommandContext'

export interface Command {
  /**
   * list of aliases for the command.
   * The first name in the list is the primary command name.
   */
  readonly commandNames: string[]

  /** usage documentation. */
  getHelpMessage(commandPrefix: string): string

  /** execute the command. */
  run(parsedUserCommand: CommandContext): Promise<void>

  /** returns true if the requesting user can use the command in the current context, or an error message otherwise. */
  hasPermissionToRun(
    parsedUserCommand: CommandContext,
  ): string | true
}
