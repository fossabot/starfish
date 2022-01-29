import { Router } from 'express'
const router = Router()

import axios from 'axios'
import c from '../../../common/dist'

router.get(`/getUserId/:tokenType/:accessToken`, async (req, res) => {
  const { tokenType, accessToken } = req.params
  if (!tokenType) return res.json({ error: `No tokenType` })
  if (!accessToken) return res.json({ error: `No accessToken` })

  axios(`https://discord.com/api/users/@me`, {
    headers: {
      authorization: `${tokenType} ${accessToken}`,
    },
  })
    .then((response) => {
      // c.log(response.data)
      if (!response.data.id) {
        res.json({
          error: `No id found for that Discord user. Try logging out and back in.`,
        })
        return
      }
      res.json({ data: response.data.id })
    })
    .catch((error) => {
      c.error(error)
      res.json({ error })
    })
})

router.get(`/loadUserGuilds/:tokenType/:accessToken`, async (req, res) => {
  const { tokenType, accessToken } = req.params
  if (!tokenType) return res.json({ error: `No tokenType` })
  if (!accessToken) return res.json({ error: `No accessToken` })

  axios(`https://discord.com/api/users/@me/guilds`, {
    headers: {
      authorization: `${tokenType} ${accessToken}`,
    },
  })
    .then((response) => {
      // c.log(response.data)
      if (!response.data.length) {
        res.json({
          error: `No guilds found for that Discord user. Try logging out and back in.`,
        })
        return
      }
      res.json({ data: response.data })
    })
    .catch((error) => {
      c.error(error)
      res.json({ error })
    })
})

export default router
