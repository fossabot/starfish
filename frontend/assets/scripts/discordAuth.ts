import * as storage from './storage'
import c from '../../../common/dist'

export function getUserId({
  tokenType,
  accessToken,
}: {
  tokenType?: string
  accessToken?: string
}): Promise<IOResponse<string>> {
  if (!tokenType) {
    tokenType = storage.get(`tokenType`)
    accessToken = storage.get(`accessToken`)
  } else {
    storage.set(`tokenType`, tokenType)
    storage.set(`accessToken`, accessToken)
  }

  return new Promise<IOResponse<string>>((resolve) => {
    fetch(`https://discord.com/api/users/@me`, {
      headers: {
        authorization: `${tokenType} ${accessToken}`,
      },
    })
      .then((result) => result.json())
      .then((response) => {
        if (!response.id) {
          resolve({
            error: `No id found for that Discord user.`,
          })
          return
        }
        resolve({ data: response.id })
      })
      .catch((error) => {
        storage.remove(`tokenType`)
        storage.remove(`accessToken`)
        resolve({ error })
      })
  })
}

export async function loadUserGameGuilds({
  userId,
  socket,
  tokenType,
  accessToken,
}: {
  userId: string
  socket: any
  tokenType?: string
  accessToken?: string
}): Promise<IOResponse<string[]>> {
  if (!tokenType) tokenType = storage.get(`tokenType`)
  if (!accessToken) accessToken = storage.get(`accessToken`)

  // c.log(`Loading user ${userId}'s guilds...`)

  const allGuilds = await fetch(
    `https://discord.com/api/users/@me/guilds`,
    {
      headers: {
        authorization: `${tokenType} ${accessToken}`,
      },
    },
  )
    .then((result) => result.json())
    .then((guildRes) => {
      if (guildRes.error) {
        c.log(
          `Error loading user discord guilds`,
          guildRes.error,
        )
        return []
      }
      if (guildRes.message) return guildRes.message
      return guildRes.map((g: any) => g?.id)
    })
    .catch((e) => {
      c.log(`Error loading user discord guilds`, e)
      storage.set(`tokenType`, tokenType)
      storage.set(`accessToken`, accessToken)
      return `Bad token`
    })

  if (!Array.isArray(allGuilds)) {
    return { error: allGuilds }
  }
  if (!allGuilds.length) {
    return { error: `No servers found!` }
  }

  return await new Promise((resolve) => {
    socket.emit(
      `ships:forUser:fromIdArray`,
      allGuilds,
      userId,
      (res: IOResponse<ShipStub[]>) => {
        if (`error` in res) {
          resolve({ error: res.error })
        } else {
          const shipIds = res.data.map(
            (s: ShipStub) => s.id,
          )
          resolve({ data: shipIds })
        }
      },
    )
  })
}
