import c from '../../../../common/dist'
import {
  Guild,
  GuildMember,
  PartialGuildMember,
} from 'discord.js'
import ioInterface from '../../ioInterface'

export default async function (
  guildMember: GuildMember | PartialGuildMember,
) {
  const ship = await ioInterface.ship.get(
    guildMember.guild.id,
  )
  if (!ship) return
  const crewMember = ship.crewMembers?.find(
    (cm) => cm.id === guildMember.id,
  )
  if (!crewMember) return

  c.log(
    `red`,
    `Member ${
      guildMember.nickname ||
      guildMember.user?.username ||
      `(unknown name)`
    } has left guild ${
      guildMember.guild.name
    }, kicking from ship...`,
  )
  ioInterface.ship.kickMember(ship.id, crewMember.id)
}
