import c from '../../../common/dist'
import Discord, { Message } from 'discord.js'
import { CommandHandler } from './commands/models/CommandHandler'

export const client = new Discord.Client({
  restTimeOffset: 0,
  messageCacheMaxSize: 2,
  messageCacheLifetime: 30,
  messageSweepInterval: 60,
})

const commandHandler = new CommandHandler('.')

export const rawWatchers: Function[] = []
let didError: string | null = null

// const privateMessage = require(`./events/privateMessage`)
// const kickedFromGuild = require(`./events/kickedFromGuild`)
// const addedToGuild = require(`./events/addedToGuild`)

// // added to a server
// client.on(`guildCreate`, addedToGuild)

// // removed from a server
// client.on(`guildDelete`, kickedFromGuild)

// // other user leaves a guild
// client.on(`guildMemberRemove`, otherMemberLeaveServer)

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
client.on(`raw`, async (event) => {
  rawWatchers.forEach((handler: Function) => handler(event))
})
client.on(`ready`, async () => {
  c.log(
    `Logged in as ${client.user?.tag} in ${
      (await client.guilds.cache.array()).length
    } guilds`,
  )
  client.user?.setActivity(`.help`, { type: `LISTENING` })
})

client.login(process.env.DISCORD_TOKEN)
