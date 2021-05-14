import c from '../../../../common/dist'
import { CommandContext } from './models/CommandContext'
import type { Command } from './models/Command'

export class InviteCommand implements Command {
  commandNames = [`invite`]

  getHelpMessage(commandPrefix: string): string {
    this.commandNames = []
    return `Use ${commandPrefix}invite to get a game bot invite link.`
  }

  async run({
    initialMessage,
  }: CommandContext): Promise<void> {
    await initialMessage.channel.send(
      `Add ${c.GAME_NAME} to your server!\nhttps://discord.com/api/oauth2/authorize?client_id=${process.env.BOT_ID}&permissions=268561472&scope=bot`,
    )
  }

  hasPermissionToRun(): string | true {
    return true
  }
}
