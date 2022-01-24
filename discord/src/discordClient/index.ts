import c from '../../../common/dist'
import Discord, { Client } from 'discord.js'
import * as fs from 'fs'
export let discordToken
try {
  discordToken = fs.readFileSync(`/run/secrets/discord_token`, `utf-8`)
} catch (e) {
  discordToken = process.env.DISCORD_TOKEN
}
discordToken = discordToken?.replace(/\n/g, ``)

import commands from './commandList'
import registerCommands from './registerCommands'

export const client: Client = new Client({
  makeCache: Discord.Options.cacheWithLimits({
    MessageManager: 0,
    GuildMemberManager: Infinity, // guild.members
    ThreadManager: 0, // channel.threads
    ThreadMemberManager: 0, // threadchannel.members
    UserManager: {
      maxSize: 0,
      keepOverLimit: (value, key, collection) => value.id === client.user?.id,
    }, // client.users
    ApplicationCommandManager: 0, // guild.commands
    BaseGuildEmojiManager: 0, // guild.emojis
    GuildBanManager: 0, // guild.bans
    GuildInviteManager: 0, // guild.invites
    GuildStickerManager: 0, // guild.stickers
    ReactionManager: 0, // message.reactions
    ReactionUserManager: 0, // reaction.users
    StageInstanceManager: 0, // guild.stageInstances
    VoiceStateManager: 0, // guild.voiceStates
  }),
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MEMBERS,
    Discord.Intents.FLAGS.DIRECT_MESSAGES,
  ],
})

export const rawWatchers: Function[] = []
let didError: string | null = null

// const privateMessage = require(`./events/privateMessage`)
import kickedFromGuild from './events/kickedFromGuild'
import addedToGuild from './events/addedToGuild'
import otherMemberLeaveServer from './events/otherMemberLeaveServer'
import handleInteraction from './interactionHandler'

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

client.on(`interactionCreate`, async (interaction) => {
  if (!interaction.isCommand()) return
  handleInteraction(interaction)
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
  const guilds = [...(await client.guilds.cache).values()]
  c.log(
    `green`,
    `Logged in as ${client.user?.tag} in:
${guilds
  .slice(0, 100)
  .map((g) => g.name.substring(0, 50))
  .join(`, `)}${
      guilds.length > 100 ? `\n(and ${guilds.length - 100} more guilds)` : ``
    }`,
  )
  client.user?.setActivity(`/help`, { type: `LISTENING` })
})

client.login(discordToken)

registerCommands(commands)
