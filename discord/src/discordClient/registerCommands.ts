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
    await connected()

    c.log(`gray`, `Started refreshing application (/) commands.`)
    if (!client?.application?.id)
      return c.log(`red`, `No application id found.`)

    // * test bot
    await rest.put(
      Routes.applicationGuildCommands(
        client.application.id,
        `805015489632796692`,
      ),
      { body: commandArray },
    )
    c.log(`gray`, `Registered test bot application (/) commands.`)

    // * all servers
    await rest.put(Routes.applicationCommands(client.application.id), {
      body: commandArray,
    })

    c.log(`gray`, `Successfully reloaded application (/) commands.`)
  } catch (error) {
    c.log(`red`, error)
  }
}
