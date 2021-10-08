import c from '../../../../../../common/dist'
import { HumanShip } from '../HumanShip'

export function checkAchievements(
  this: HumanShip,
  typePrefix?: string,
) {
  for (let achievement of Object.values(
    c.achievements,
  ).filter(
    (a) => !typePrefix || a.id.indexOf(typePrefix) === 0,
  )) {
    if (!achievement.condition) continue
    let ok = true
    const condition = achievement.condition
    if (condition === true) {
      ok = true
    } else {
      if (condition?.membersIn) {
        const toCheck = Array.isArray(condition.membersIn)
          ? condition.membersIn
          : [condition.membersIn]

        for (let con of toCheck) {
          const requiredAmount =
            con.amount === `all`
              ? this.crewMembers.length
              : con.amount
          if (
            this.membersIn(con.roomId).length <
            requiredAmount
          )
            ok = false
        }
      }
      if (ok && condition?.prop) {
        const toCheck = Array.isArray(condition.prop)
          ? condition.prop
          : [condition.prop]

        for (let con of toCheck) {
          if (con.is && this[con.id] !== con.is) ok = false
          else if (
            con.secondaryId &&
            this[con.id]?.id !== con.secondaryId
          )
            ok = false
          else if (con.length && con.amount) {
            if (
              con.lte &&
              (this[con.id]?.length || Infinity) >
                con.amount
            )
              ok = false
            else if (
              (this[con.id]?.length || 0) < con.amount
            )
              ok = false
          } else if (con.amount) {
            if ((this[con.id] || 0) < con.amount) ok = false
          }
        }
      }
      if (ok && condition?.stat) {
        const toCheck = Array.isArray(condition.stat)
          ? condition.stat
          : [condition.stat]

        for (let con of toCheck) {
          const stat = this.stats.find(
            (s) => s.stat === con.id,
          )
          if (!stat) ok = false
          else if (con.lte && stat.amount > con.amount)
            ok = false
          else if (stat.amount < con.amount) ok = false
        }
      }
    }

    if (ok) this.addAchievement(achievement.id)
  }
}

export function addAchievement(
  this: HumanShip,
  achievementIds: string | string[],
  silent = false,
) {
  if (!Array.isArray(achievementIds))
    achievementIds = [achievementIds]
  const newIds = achievementIds.filter(
    (id) => !this.achievements.includes(id),
  )
  if (!newIds.length) return

  // if (!this.tutorial)
  //   c.log(
  //     `adding achievement/s to ${this.name} (${this.id}):`,
  //     newIds,
  //   )

  const achievements = Object.values(c.achievements).filter(
    (achievement) => newIds.includes(achievement.id),
  )

  for (let achievement of achievements) {
    this.achievements.push(achievement.id)
    this.toUpdate.achievements = this.achievements

    for (let reward of Array.isArray(achievement.reward)
      ? achievement.reward
      : [achievement.reward]) {
      if (reward.tagline)
        addTagline(
          this,
          reward.tagline,
          achievement.for,
          Boolean(silent || achievement.silent),
        )
      if (reward.headerBackground)
        addHeaderBackground(
          this,
          reward.headerBackground,
          achievement.for,
          Boolean(silent || achievement.silent),
        )
    }
  }
}

// ----- cosmetics -----
function addTagline(
  ship: HumanShip,
  tagline: string,
  reason: string,
  silent: boolean,
) {
  if (ship.availableTaglines.find((t) => t === tagline))
    return
  ship.availableTaglines.push(tagline)
  ship.toUpdate.availableTaglines = ship.availableTaglines

  if (!silent)
    ship.logEntry(
      [
        `Unlocked a new ship tagline for ${reason}:`,
        { text: `"${tagline}"`, color: `var(--success)` },
      ],
      `high`,
    )
}

function addHeaderBackground(
  ship: HumanShip,
  bg: { id: string; url: string },
  reason: string,
  silent: boolean,
) {
  if (ship.availableHeaderBackgrounds.find((b) => b === bg))
    return
  ship.availableHeaderBackgrounds.push(bg)
  ship.toUpdate.availableHeaderBackgrounds =
    ship.availableHeaderBackgrounds

  if (!silent)
    ship.logEntry(
      [
        `Unlocked a new ship header for ${reason}:`,
        { text: `"${bg.id}"`, color: `var(--success)` },
      ],
      `high`,
    )
}
