import c from '../../../../../../common/dist'
import type { CrewMember } from '../CrewMember'

const effects: {
  [key in CrewActiveId]: (
    cm: CrewMember,
    a: CrewActive,
    d: CrewActiveData,
    i: number,
  ) => string | Promise<string>
} = {
  repairDrone: (cm, a, d, i) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    cm.ship.applyTimedPassive({
      id: `autoRepair`,
      intensity: i,
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
    return `Deployed a nanorepair swarm that lasts for ${c.msToTimeString(
      duration,
    )}!`
  },

  combatDrone: async (cm, a, d, i) => {
    const s = await cm.ship.game?.addAIShip({
      neverAttackIds: [cm.ship.id],
      spawnedById: cm.ship.id,
      guildId: cm.ship.guildId,
      name: `Drone`,
      until:
        Date.now() + (d.duration || 1000 * 60 * 60 * 1),
      location: [
        ...(cm.ship.location.map(
          (l) => l + c.randomBetween(-1, 1) * 0.0001,
        ) as [number, number]),
      ],
      level:
        1 +
        Math.floor(c.getActiveIntensity(a, cm.level) * 4),
    })
    s?.applyPassive({ id: `boostDamage`, intensity: i })
    s?.applyPassive({
      id: `boostWeaponChargeSpeed`,
      intensity: i,
    })
    return `Released a level ${
      1 + Math.floor(c.getActiveIntensity(a, cm.level) * 4)
    } combat drone that lasts for ${c.msToTimeString(
      d.duration || 1000 * 60 * 60 * 1,
    )}!`
  },

  cargoSweep: (cm, a, d, i) => {
    if (c.lottery(i, 1)) {
      const id = c.randomFromArray([
        ...Object.keys(c.cargo),
      ]) as CargoId
      const amount = c.r2(Math.random() * 2 * i, 2) + 0.01
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

  instantStamina: (cm, a, d, i) => {
    cm.stamina += i
    if (cm.stamina > 1) cm.stamina = 1
    cm.toUpdate.stamina = cm.stamina
    return `Stamina boosted by ${c.r2(i * 100, 0)}!`
  },

  boostShipSightRange: (cm, a, d, i) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedShipPassiveFromActive(
      `boostSightRange`,
      i,
      duration,
      a,
      cm,
    )
    return `Ship sight range boosted by ${c.r2(
      i * 100,
      0,
    )}% for ${c.msToTimeString(duration)}!`
  },

  weaponRechargeSpeed: (cm, a, d, i) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedShipPassiveFromActive(
      `boostWeaponChargeSpeed`,
      i,
      duration,
      a,
      cm,
    )
    return `Weapon recharge speed boosted by ${c.r2(
      i * 100,
      0,
    )}% for ${c.msToTimeString(duration)}!`
  },

  boostCharisma: (cm, a, d, i) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedCrewPassiveFromActive(
      `boostCharisma`,
      Math.floor(c.getActiveIntensity(a, cm.level) * 4) + 1,
      duration,
      a,
      cm,
    )
    return `Charisma boosted by ${c.r2(
      Math.floor(c.getActiveIntensity(a, cm.level) * 4) + 1,
      0,
    )} for ${c.msToTimeString(duration)}!`
  },

  boostDexterity: (cm, a, d, i) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedCrewPassiveFromActive(
      `boostDexterity`,
      Math.floor(c.getActiveIntensity(a, cm.level) * 4) + 1,
      duration,
      a,
      cm,
    )
    return `Dexterity boosted by ${c.r2(
      Math.floor(c.getActiveIntensity(a, cm.level) * 4) + 1,
      0,
    )} for ${c.msToTimeString(duration)}!`
  },

  boostStrength: (cm, a, d, i) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedCrewPassiveFromActive(
      `boostStrength`,
      Math.floor(c.getActiveIntensity(a, cm.level) * 4) + 1,
      duration,
      a,
      cm,
    )
    return `Strength boosted by ${c.r2(
      Math.floor(c.getActiveIntensity(a, cm.level) * 4) + 1,
      0,
    )} for ${c.msToTimeString(duration)}!`
  },

  boostIntellect: (cm, a, d, i) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedCrewPassiveFromActive(
      `boostIntellect`,
      Math.floor(c.getActiveIntensity(a, cm.level) * 4) + 1,
      duration,
      a,
      cm,
    )
    return `Intellect boosted by ${c.r2(
      Math.floor(c.getActiveIntensity(a, cm.level) * 4) + 1,
      0,
    )} for ${c.msToTimeString(duration)}!`
  },

  boostMorale: (cm, a, d, i) => {
    cm.ship.crewMembers.forEach((member) =>
      member.changeMorale(i),
    )
    return `Morale boosted by ${c.r2(i * 100, 0)}%!`
  },
}

function applyTimedShipPassiveFromActive(
  id: ShipPassiveEffectId,
  intensity,
  duration,
  active,
  crewMember: CrewMember,
) {
  crewMember.ship.applyTimedPassive({
    id,
    intensity,
    until: Date.now() + duration,
    data: {
      source: {
        crewActive: {
          activeId: active.id,
          crewMemberId: crewMember.id,
        },
      },
    },
  })
}

function applyTimedCrewPassiveFromActive(
  id: CrewPassiveId,
  intensity,
  duration,
  active,
  crewMember: CrewMember,
) {
  crewMember.applyTimedPassive({
    id,
    intensity,
    until: Date.now() + duration,
    data: {
      source: {
        crewActive: {
          activeId: active.id,
          crewMemberId: crewMember.id,
        },
      },
    },
  })
}

export async function useActive(
  this: CrewMember,
  activeId: CrewActiveId,
): Promise<{ result: string } | { error: string }> {
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

  this.changeMorale(0.05)

  active.lastUsed = Date.now()
  this.lastActiveUse = Date.now()
  this.toUpdate.lastActiveUse = this.lastActiveUse

  let res: string
  if (effects[activeId]) {
    res = await effects[activeId](
      this,
      active,
      data,
      c.getActiveIntensity(active, this.level),
    )
  } else
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
          tooltipData: data.description(active, this.level),
        },
        `&nospace.`,
      ],
      `medium`,
      active.id === `combatDrone` ? `drone` : `ability`,
      true,
    )

  this.toUpdate.actives = this.actives

  return { result: res }
}

export function addActive(
  this: CrewMember,
  active: CrewActive,
) {
  // if (this.actives.length >= this.activeSlots) return
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
