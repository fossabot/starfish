import c from '../../../common/dist'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { discordToken, client, connected } from '.'
import { Command } from './models/Command'

export default async function registerCommands(commands: Command[]) {
  const commandArray: any[] = []
  commands.forEach((co) => {
    commandArray.push(...co.slashCommands.map((sc) => sc.toJSON()))
  })

  const rest = new REST({ version: `9` }).setToken(discordToken)

  try {
    c.log(`gray`, `Started refreshing application (/) commands.`)
    while (!client?.application?.id) await connected()

    // * test bot
    await rest
      .put(
        Routes.applicationGuildCommands(
          client.application.id,
          `805015489632796692`,
        ),
        { body: commandArray },
      )
      .catch((e) =>
        c.error(`Error refreshing single-server application commands:`, e),
      )
    c.log(`gray`, `Registered test bot application (/) commands.`)

    // * all servers
    await rest
      .put(Routes.applicationCommands(client.application.id), {
        body: commandArray,
      })
      .catch((e) => c.error(`Error refreshing application commands:`, e))

    c.log(`gray`, `Successfully reloaded application (/) commands.`)
  } catch (error) {
    c.error(error)
  }
}
