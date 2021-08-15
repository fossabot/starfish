import c from '../../../common/dist'
import * as Discord from 'discord.js'
import * as fs from 'fs'
let discordToken
try {
  discordToken = fs.readFileSync(
    `/run/secrets/discord_token`,
    `utf-8`,
  )
} catch (e) {
  discordToken = process.env.DISCORD_TOKEN
}
discordToken = discordToken?.replace(/\n/g, ``)

import { CommandHandler } from './CommandHandler'

export const client = new Discord.Client({
  restTimeOffset: 0,
  messageCacheMaxSize: 2,
  messageCacheLifetime: 30,
  messageSweepInterval: 60,
})

import disbut from 'discord-buttons'
disbut(client)

const commandHandler = new CommandHandler(`.`)

export const rawWatchers: Function[] = []
let didError: string | null = null

// const privateMessage = require(`./events/privateMessage`)
import kickedFromGuild from './events/kickedFromGuild'
import addedToGuild from './events/addedToGuild'
import otherMemberLeaveServer from './events/otherMemberLeaveServer'

export async function connected(): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    if (didError) resolve(false)
    if (client.readyAt) {
      resolve(true)
      return
    }
    let timeout = 0
    while (timeout < 200) {
      // 20 seconds
      await c.sleep(100)
      if (didError) resolve(false)
      if (client.readyAt) {
        resolve(true)
        return
      }
      timeout++
    }
    resolve(false)
  })
}

client.on(`error`, (e) => {
  c.log(`red`, `Discord.js error:`, e.message)
  didError = e.message
})
client.on(`message`, async (msg) => {
  if (!msg.author || msg.author.bot) return
  commandHandler.handleMessage(msg)
})

// added to a server
client.on(`guildCreate`, addedToGuild)

// removed from a server
client.on(`guildDelete`, kickedFromGuild)

// other user leaves a guild
client.on(`guildMemberRemove`, otherMemberLeaveServer)

client.on(`raw`, async (event) => {
  rawWatchers.forEach((handler: Function) => handler(event))
})
client.on(`ready`, async () => {
  const guilds = await client.guilds.cache.array()
  c.log(
    `green`,
    `Logged in as ${client.user?.tag} in:
${guilds
  .slice(0, 100)
  .map((g) => g.name.substring(0, 50))
  .join(`\n`)}${
      guilds.length > 100
        ? `\n(and ${guilds.length - 100} more guilds)`
        : ``
    }`,
  )
  client.user?.setActivity(`.help`, { type: `LISTENING` })
})

client.login(discordToken)
