'use strict'
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k]
          },
        })
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        o[k2] = m[k]
      })
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', {
          enumerable: true,
          value: v,
        })
      }
    : function (o, v) {
        o['default'] = v
      })
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod
    var result = {}
    if (mod != null)
      for (var k in mod)
        if (
          k !== 'default' &&
          Object.prototype.hasOwnProperty.call(mod, k)
        )
          __createBinding(result, mod, k)
    __setModuleDefault(result, mod)
    return result
  }
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', {
  value: true,
})
const dist_1 = __importDefault(
  require('../../../../common/dist'),
)
const Discord = __importStar(require('discord.js'))
const __1 = require('..')
const checkPermissions_1 = __importDefault(
  require('./checkPermissions'),
)
async function resolveOrCreateChannel({
  name,
  topic,
  permissions = [],
  guild,
}) {
  const permissionsRes = await checkPermissions_1.default({
    requiredPermissions: [`MANAGE_CHANNELS`],
    guild,
  })
  if (`error` in permissionsRes) {
    dist_1.default.log(permissionsRes)
    return null
  }
  if (permissionsRes.message)
    dist_1.default.log(permissionsRes.message)
  // ----- get bot role -----
  const existingRoles = (
    await guild.roles.fetch()
  ).cache.array()
  const botRole = existingRoles.find(
    (role) => role.name === __1.client.user?.username,
  )
  if (!botRole) {
    return null
  }
  const existingChannels =
    await guild.channels.cache.array()
  let existingSubChannels = []
  let parentCategory = null
  // ----- get/make category -----
  const existingCategory = existingChannels.find(
    (ch) =>
      ch instanceof Discord.CategoryChannel &&
      ch.name === dist_1.default.gameName,
  )
  if (existingCategory) {
    parentCategory = existingCategory
    existingSubChannels = existingChannels.filter(
      (c) =>
        c instanceof Discord.TextChannel &&
        c.parentID === existingCategory.id,
    )
  } else {
    const createdCategory = await guild.channels
      .create(dist_1.default.gameName, {
        type: `category`,
        position: 99999,
        reason: `Game initialization`,
      })
      .catch(dist_1.default.log)
    if (createdCategory) parentCategory = createdCategory
  }
  if (!parentCategory) return null
  // ----- get/make channel -----
  const existing = existingSubChannels.find(
    (c) =>
      c.name === name.toLowerCase().replace(/\s/g, `-`),
  )
  if (existing) return existing
  const channel =
    (await guild.channels
      .create(name, {
        reason: `Game initialization`,
        parent: parentCategory,
        topic,
        permissionOverwrites: permissions,
      })
      .catch(dist_1.default.log)) || null
  return channel
}
exports.default = resolveOrCreateChannel
//# sourceMappingURL=createChannel.js.map
