import c from '../../../common/dist'
import Discord from 'discord.js-light'
export const client = new Discord.Client({
  cacheGuilds: true,
  cacheChannels: false,
  cacheOverwrites: true, // permission overwrites
  cacheRoles: false,
  cacheEmojis: false,
  cachePresences: false,
  restTimeOffset: 0,
  messageCacheMaxSize: 2,
  messageCacheLifetime: 30,
  messageSweepInterval: 60,
  disabledEvents: [
    `GUILD_ROLE_CREATE`,
    `GUILD_ROLE_DELETE`,
    `GUILD_ROLE_UPDATE`,
    `GUILD_BAN_ADD`,
    `GUILD_BAN_REMOVE`,
    `GUILD_EMOJIS_UPDATE`,
    `GUILD_INTEGRATIONS_UPDATE`,
    `CHANNEL_PINS_UPDATE`,
    `PRESENCE_UPDATE`,
    `TYPING_START`,
    `TYPING_END`,
    `VOICE_STATE_UPDATE`,
    `VOICE_SERVER_UPDATE`,
  ],
})

export const rawWatchers: Function[] = []
let didError: string | null = null

// const privateMessage = require(`./events/privateMessage`)
// const guildMessage = require(`./events/guildMessage`)
// const kickedFromGuild = require(`./events/kickedFromGuild`)
// const addedToGuild = require(`./events/addedToGuild`)

// // added to a server
// client.on(`guildCreate`, addedToGuild)

// // removed from a server
// client.on(`guildDelete`, kickedFromGuild)

// // other user leaves a guild
// // client.on(`guildMemberRemove`, otherMemberLeaveServer)

client.on(`error`, (e) => {
  c.log(`red`, `Discord.js error:`, e.message)
  didError = e.message
})
client.on(`message`, async (msg) => {
  if (!msg.author || msg.author.bot) return
  c.log(`gray`, msg.content)
  // if (!msg.guild || !msg.guild.available)
  //   return privateMessage({ msg, client })
  // return guildMessage({ msg, client })
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
