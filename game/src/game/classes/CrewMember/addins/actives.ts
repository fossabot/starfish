import c from '../../../../../../common/dist'
import type { CrewMember } from '../CrewMember'

const effects: {
  [key in CrewActiveId]: (
    cm: CrewMember,
    a: CrewActive,
    d: CrewActiveData,
  ) => string
} = {
  cargoSweep: (cm, a, d) => {
    if (c.lottery(a.intensity, 1)) {
      const id = c.randomFromArray([
        ...Object.keys(c.cargo),
      ]) as CargoId
      const amount =
        c.r2(Math.random() * 2 * a.intensity, 2) + 0.01
      const leftOver = cm.addCargo(id, amount)
      return `Discovered ${c.r2(
        amount * 1000,
      )}kg of ${id}!${
        leftOver
          ? ` (But you couldn't carry ${c.r2(
              leftOver * 1000,
            )}kg of it)`
          : ``
      }`
    }
    return `You didn't find anything this time.`
  },

  instantStamina: (cm, a, d) => {
    cm.stamina += a.intensity
    if (cm.stamina > 1) cm.stamina = 1
    cm.toUpdate.stamina = cm.stamina
    return `Stamina boosted by ${a.intensity * 100}!`
  },

  boostShipSightRange: (cm, a, d) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    cm.ship.applyTimedPassive({
      id: `boostSightRange`,
      intensity: a.intensity,
      until: Date.now() + duration,
      data: {
        source: {
          crewActive: {
            activeId: a.id,
            crewMemberId: cm.id,
          },
        },
      },
    })
    return `Ship sight range boosted by ${c.r2(
      a.intensity * 100,
      0,
    )}% for ${c.msToTimeString(duration)}!`
  },
}

export function useActive(
  this: CrewMember,
  activeId: CrewActiveId,
): { result: string } | { error: string } {
  const active = this.actives.find((a) => a.id === activeId)
  const data = c.crewActives[activeId]

  if (!active || !data)
    return {
      error: `You don't have that ability.`,
    }

  if (
    data.cooldown - (Date.now() - (active.lastUsed || 0)) >
    0
  )
    return {
      error: `That ability is on cooldown.`,
    }

  if (
    c.crewActiveBaseGlobalCooldown -
      (Date.now() - this.lastActiveUse) >
    0
  )
    return {
      error: `You can't use another ability so soon.`,
    }
  active.lastUsed = Date.now()
  this.lastActiveUse = Date.now()
  this.toUpdate.lastActiveUse = this.lastActiveUse

  let res: string
  if (effects[activeId])
    res = effects[activeId](this, active, data)
  else
    return {
      error: `That ability is not implemented yet.`,
    }

  if (data.notify)
    this.ship.logEntry(
      [
        {
          text: this.name,
          color: `var(--item)`,
          tooltipData: { type: `crewMember`, id: this.id },
        },
        `used`,
        {
          text: data.displayName,
          color: `var(--item)`,
          tooltipData: data.description(active),
        },
        `&nospace.`,
      ],
      `medium`,
      `ability`,
      true,
    )

  this.toUpdate.actives = this.actives

  return { result: res }
}

export function addActive(
  this: CrewMember,
  active: CrewActive,
) {
  const found = this.actives.find((a) => a.id === active.id)
  if (found) {
    found.intensity = Math.max(
      found.intensity,
      active.intensity,
    )
    this.toUpdate.actives = this.actives
    return
  }
  this.actives.push(active)
  this.toUpdate.actives = this.actives
}

export function removeActive(
  this: CrewMember,
  activeId: CrewActiveId,
) {
  const active = this.actives.find((a) => a.id === activeId)
  if (!active) return
  this.actives = this.actives.filter(
    (a) => a.id !== activeId,
  )
  this.toUpdate.actives = this.actives
}
