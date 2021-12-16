import c from '../../../../../../common/dist'
import type { CombatShip } from '../../Ship/CombatShip'
import type { CrewMember } from '../CrewMember'

const effects: {
  [key in CrewActiveId]: (
    cm: CrewMember,
    a: CrewActive,
    d: CrewActiveData,
    displayIntensity: number,
    baseIntensity: number,
  ) => string | Promise<string>
} = {
  repairDrone: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    cm.ship.applyTimedPassive({
      id: `autoRepair`,
      intensity: baseIntensity,
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

  combatDrone: async (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
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
      level: displayIntensity,
    })
    s?.applyPassive({
      id: `boostDamage`,
      intensity: baseIntensity,
    })
    s?.applyPassive({
      id: `boostWeaponChargeSpeed`,
      intensity: baseIntensity,
    })
    return `Released a level ${displayIntensity} combat drone that lasts for ${c.msToTimeString(
      d.duration || 1000 * 60 * 60 * 1,
    )}!`
  },

  cargoSweep: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    if (c.lottery(baseIntensity, 1)) {
      const id = c.randomFromArray([
        ...Object.keys(c.cargo),
      ]) as CargoId
      const amount =
        c.r2(Math.random() * 2 * baseIntensity, 2) + 0.01
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

  instantStamina: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    cm.stamina += baseIntensity
    if (cm.stamina > 1) cm.stamina = 1
    cm.toUpdate.stamina = cm.stamina
    return `Stamina boosted by ${displayIntensity}!`
  },

  boostShipSightRange: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedShipPassiveFromActive(
      `boostSightRange`,
      baseIntensity,
      duration,
      a,
      cm,
    )
    return `Ship sight range boosted by ${displayIntensity}% for ${c.msToTimeString(
      duration,
    )}!`
  },

  boostWeaponChargeSpeed: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedShipPassiveFromActive(
      `boostWeaponChargeSpeed`,
      baseIntensity,
      duration,
      a,
      cm,
    )
    return `Weapon recharge speed boosted by ${displayIntensity}% for ${c.msToTimeString(
      duration,
    )}!`
  },

  boostCharisma: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedCrewPassiveFromActive(
      `boostCharisma`,
      baseIntensity,
      duration,
      a,
      cm,
    )
    return `Charisma boosted by ${baseIntensity} for ${c.msToTimeString(
      duration,
    )}!`
  },

  boostDexterity: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedCrewPassiveFromActive(
      `boostDexterity`,
      baseIntensity,
      duration,
      a,
      cm,
    )
    return `Dexterity boosted by ${baseIntensity} for ${c.msToTimeString(
      duration,
    )}!`
  },

  boostStrength: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedCrewPassiveFromActive(
      `boostStrength`,
      baseIntensity,
      duration,
      a,
      cm,
    )
    return `Strength boosted by ${baseIntensity} for ${c.msToTimeString(
      duration,
    )}!`
  },

  boostIntellect: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedCrewPassiveFromActive(
      `boostIntellect`,
      baseIntensity,
      duration,
      a,
      cm,
    )
    return `Intellect boosted by ${baseIntensity} for ${c.msToTimeString(
      duration,
    )}!`
  },

  boostMorale: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    cm.ship.crewMembers.forEach((member) =>
      member.changeMorale(baseIntensity),
    )
    return `Crew morale boosted by ${displayIntensity}%!`
  },
  seeTrailColors: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedShipPassiveFromActive(
      `alwaysSeeTrailColors`,
      baseIntensity,
      duration,
      a,
      cm,
    )
    return `You can see the trail colors of other ships!`
  },
  boostChassisAgility: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedShipPassiveFromActive(
      `boostChassisAgility`,
      baseIntensity,
      duration,
      a,
      cm,
    )
    return `Chassis agility boosted by ${displayIntensity}% for ${c.msToTimeString(
      duration,
    )}!`
  },
  boostDamageToEngines: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedShipPassiveFromActive(
      `boostDamageToItemType`,
      baseIntensity,
      duration,
      a,
      cm,
      { type: `engine` },
    )
    return `Damage to engines boosted by ${displayIntensity}% for ${c.msToTimeString(
      duration,
    )}!`
  },
  boostDamageToScanners: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedShipPassiveFromActive(
      `boostDamageToItemType`,
      baseIntensity,
      duration,
      a,
      cm,
      { type: `scanner` },
    )
    return `Damage to scanners boosted by ${displayIntensity}% for ${c.msToTimeString(
      duration,
    )}!`
  },
  boostDamageToWeapons: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedShipPassiveFromActive(
      `boostDamageToItemType`,
      baseIntensity,
      duration,
      a,
      cm,
      { type: `weapon` },
    )
    return `Damage to weapons boosted by ${displayIntensity}% for ${c.msToTimeString(
      duration,
    )}!`
  },
  boostMineSpeed: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedShipPassiveFromActive(
      `boostMineSpeed`,
      baseIntensity,
      duration,
      a,
      cm,
    )
    return `Mine speed boosted by ${displayIntensity}% for ${c.msToTimeString(
      duration,
    )}!`
  },
  boostRepairSpeed: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedShipPassiveFromActive(
      `boostRepairSpeed`,
      baseIntensity,
      duration,
      a,
      cm,
    )
    return `Repair speed boosted by ${displayIntensity}% for ${c.msToTimeString(
      duration,
    )}!`
  },
  boostThrust: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedShipPassiveFromActive(
      `boostThrust`,
      baseIntensity,
      duration,
      a,
      cm,
    )
    return `Thrust boosted by ${displayIntensity}% for ${c.msToTimeString(
      duration,
    )}!`
  },
  damageToAllNearbyEnemies: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    const range = d.range || 0.01
    const nearbyShips = (
      cm.ship.game?.scanCircle(
        cm.ship.location,
        range,
        cm.ship.id,
        [`aiShip`, `humanShip`],
      )?.ships || []
    ).filter(
      (s) =>
        `takeDamage` in s && s.guildId !== cm.ship.guildId,
    ) as CombatShip[]
    let didHit = 0
    for (let s of nearbyShips) {
      const res = cm.ship.attack(
        s,
        {
          displayName: d.displayName,
          damage: baseIntensity,
        },
        `any`,
        1000,
      )
      if (res.damageTaken > 0) didHit++
    }

    if (nearbyShips.length)
      return `Hit ${didHit} nearby enem${
        didHit === 1 ? `y` : `ies`
      }!`
    return `No enemies were in range.`
  },

  flatDamageReduction: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedShipPassiveFromActive(
      `flatDamageReduction`,
      baseIntensity,
      duration,
      a,
      cm,
    )
    return `Damage reduced by ${displayIntensity} for ${c.msToTimeString(
      duration,
    )}!`
  },

  fullCrewSkillBoost: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedShipPassiveFromActive(
      `flatSkillBoost`,
      baseIntensity,
      duration,
      a,
      cm,
    )
    return `Full crew skills boosted by ${displayIntensity} for ${c.msToTimeString(
      duration,
    )}!`
  },
  generalImprovementPerCrewMemberInSameRoom: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedCrewPassiveFromActive(
      `generalImprovementPerCrewMemberInSameRoom`,
      baseIntensity,
      duration,
      a,
      cm,
    )
    return `${displayIntensity}% better performance per crew member in same room for ${c.msToTimeString(
      duration,
    )}!`
  },
  generalImprovementWhenAlone: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedCrewPassiveFromActive(
      `generalImprovementWhenAlone`,
      baseIntensity,
      duration,
      a,
      cm,
    )
    return `${displayIntensity}% better performance when alone for ${c.msToTimeString(
      duration,
    )}!`
  },
  broadcastRangeCargoPrices: (
    cm,
    a,
    d,
    displayIntensity,
    baseIntensity,
  ) => {
    const duration = d.duration || 1000 * 60 * 60 * 1
    applyTimedShipPassiveFromActive(
      `broadcastRangeCargoPrices`,
      baseIntensity,
      duration,
      a,
      cm,
    )
    return `Cargo prices visible at planets within broadcast range for ${c.msToTimeString(
      duration,
    )}!`
  },
}

function applyTimedShipPassiveFromActive(
  id: ShipPassiveEffectId,
  intensity,
  duration,
  active,
  crewMember: CrewMember,
  data?: { type: ItemType },
) {
  crewMember.ship.applyTimedPassive({
    id,
    intensity,
    until: Date.now() + duration,
    data: {
      ...data,
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

  if (!effects[activeId])
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

  const res = await effects[activeId](
    this,
    active,
    data,
    data.displayIntensity(active.intensity, this.level),
    data.intensityAdapter(
      c.getActiveIntensityScaledByLevel(
        active.intensity,
        this.level,
      ),
    ),
  )

  this.toUpdate.actives = this.actives

  return { result: res }
}

export function addActive(
  this: CrewMember,
  active: CrewActive,
) {
  // if (this.actives.length >= this.activeSlots) return
  if (!active.lastUsed) active.lastUsed = 0
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
