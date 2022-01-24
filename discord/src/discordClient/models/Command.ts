import { Message } from 'discord.js'
import c from '../../../../common/dist'
import { InteractionContext } from './getInteractionContext'
import { SlashCommandBuilder } from '@discordjs/builders'

export interface CommandStub {
  /**
   * list of aliases for the command.
   * The first name in the list is the primary command name.
   */
  commandNames: string[]

  args?: {
    type: `boolean` | `string` | `number` | `user`
    name: string
    prompt: string
    required?: boolean
    choices?: (string | { name: string; value: string })[]
  }[]
  replyEphemerally?: boolean

  requiresShip?: boolean
  requiresCrewMember?: boolean
  requiresCaptain?: boolean
  requiresPlanet?: boolean
  allowDm?: boolean

  /** usage documentation. */
  getDescription(...args: any[]): string

  /** execute the command. */
  run(parsedUserCommand: InteractionContext): Promise<void>

  /** returns true if the requesting user can use the command in the current context, or an error message otherwise. Returns an empty string to fail silently. */
  hasPermissionToRun?(parsedUserCommand: InteractionContext): string | true
}

export class Command {
  readonly stub: CommandStub
  readonly commandNames: string[]
  readonly args?: {
    type: `boolean` | `string` | `number` | `user`
    name: string
    prompt: string
    required?: boolean
    choices?: (string | { name: string; value: string })[]
  }[]

  readonly replyEphemerally: boolean = false

  readonly slashCommands: SlashCommandBuilder[] = []

  requiresShip?: boolean
  requiresCrewMember?: boolean
  requiresCaptain?: boolean
  requiresPlanet?: boolean
  allowDm?: boolean

  /** usage documentation. */
  getDescription: () => string

  /** execute the command. */
  run: (parsedUserCommand: InteractionContext) => Promise<void>

  /** returns true if the requesting user can use the command in the current context, or an error message otherwise. Returns an empty string to fail silently. */
  hasPermissionToRun?: (parsedUserCommand: InteractionContext) => string | true

  constructor(stub: CommandStub) {
    this.stub = stub
    this.commandNames = stub.commandNames
    this.replyEphemerally = Boolean(stub.replyEphemerally)
    this.args = stub.args
    this.requiresCaptain = Boolean(stub.requiresCaptain)
    this.requiresCrewMember = Boolean(stub.requiresCrewMember)
    this.requiresPlanet = Boolean(stub.requiresPlanet)
    this.requiresShip = Boolean(stub.requiresShip)
    this.allowDm = Boolean(stub.allowDm)
    this.getDescription = stub.getDescription
    this.run = stub.run
    this.hasPermissionToRun = stub.hasPermissionToRun

    for (let commandName of this.commandNames) {
      const sc = new SlashCommandBuilder()
        .setName(commandName)
        .setDescription(
          this.getDescription() +
            (this.requiresCaptain ? ` (captain/admin only)` : ``),
        )

      if (this.args) {
        this.args.forEach((arg) => {
          if (arg.type === `boolean`)
            sc.addBooleanOption((option) =>
              option
                .setName(arg.name)
                .setDescription(arg.prompt)
                .setRequired(arg.required || false),
            )
          if (arg.type === `string`)
            sc.addStringOption((option) => {
              const o = option
                .setName(arg.name)
                .setDescription(arg.prompt)
                .setRequired(arg.required || false)
              if (arg.choices) {
                for (let choice of arg.choices) {
                  o.addChoice(
                    typeof choice === `string` ? choice : choice.name,
                    typeof choice === `string` ? choice : choice.value,
                  )
                }
              }
              return o
            })
          if (arg.type === `number`)
            sc.addNumberOption((option) =>
              option
                .setName(arg.name)
                .setDescription(arg.prompt)
                .setRequired(arg.required || false),
            )
          if (arg.type === `user`)
            sc.addUserOption((option) =>
              option
                .setName(arg.name)
                .setDescription(arg.prompt)
                .setRequired(arg.required || false),
            )
        })
      }

      this.slashCommands.push(sc)
    }
  }
}
