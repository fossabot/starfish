import c from '../../../../../../common/dist'
import { HumanShip } from '../HumanShip/HumanShip'

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
          if (
            con.is &&
            !con.secondaryId &&
            this[con.id] !== con.is
          )
            ok = false
          else if (
            con.secondaryId &&
            !con.is &&
            this[con.id]?.id !== con.secondaryId
          )
            ok = false
          else if (
            con.secondaryId &&
            con.is &&
            this[con.id]?.[con.secondaryId] !== con.is
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

    // c.log(achievement.condition, ok)

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

  // if (!this.tutorial && !silent)
  //   c.log(
  //     `adding achievement/s to ${this.name} (${this.id}):`,
  //     newIds,
  //   )

  const achievements = Object.values(c.achievements).filter(
    (achievement) => newIds.includes(achievement.id),
  )

  for (let achievement of achievements) {
    this.achievements.push(achievement.id)

    for (let reward of Array.isArray(achievement.reward)
      ? achievement.reward
      : [achievement.reward]) {
      if (reward.tagline)
        this.addTagline(
          reward.tagline,
          achievement.for,
          Boolean(silent || achievement.silent),
        )
      if (reward.headerBackground)
        this.addHeaderBackground(
          reward.headerBackground,
          achievement.for,
          Boolean(silent || achievement.silent),
        )
    }
  }
  this.toUpdate.achievements = this.achievements
}

// ----- cosmetics -----
export function addTagline(
  this: HumanShip,
  tagline: string,
  reason: string | null,
  silent: boolean,
) {
  if (this.availableTaglines.find((t) => t === tagline))
    return
  this.availableTaglines.push(tagline)
  this.toUpdate.availableTaglines = this.availableTaglines

  if (!silent)
    this.logEntry(
      [
        `Ship tagline unlocked for ${reason}:`,
        { text: `"${tagline}"`, color: `var(--success)` },
      ],
      `high`,
      `party`,
    )
}

export function addHeaderBackground(
  this: HumanShip,
  bg: HeaderBackground,
  reason: string | null,
  silent: boolean,
) {
  if (this.availableHeaderBackgrounds.find((b) => b === bg))
    return
  this.availableHeaderBackgrounds.push(bg)
  this.toUpdate.availableHeaderBackgrounds =
    this.availableHeaderBackgrounds

  if (!silent) {
    this.logEntry(
      [
        `Ship header unlocked for ${reason}:`,
        { text: `"${bg.id}"`, color: `var(--success)` },
      ],
      `high`,
      `party`,
    )
  }
}
