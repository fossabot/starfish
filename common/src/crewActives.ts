import math from './math'
import text from './text'
import constants from './gameConstants'
import log from './log'

export const crewActiveBaseGlobalCooldown = 1000 * 60 * 60 * 24 * 1

export const activeUnlockLevels = [
  5, 10, 15, 25, 35, 45, 55, 65, 75, 85, 95, 100,
]

export function getActiveIntensityScaledByLevel(
  intensity: number,
  level: number,
) {
  return (intensity || 1) * math.lerp(1, 4, (level - 1) / 100)
}

export const crewActives: {
  [key in CrewActiveId]: CrewActiveData
} = {
  instantStamina: {
    id: `instantStamina`,
    displayName: `Sunny Day`,
    description: function (a, level) {
      return `Instantly gain ${this.displayIntensity(
        a.intensity,
        level,
      )} stamina.`
    },
    cooldown: crewActiveBaseGlobalCooldown * 2,
    intensityAdapter: (i) => i,
    displayIntensity: function (i, level = 0) {
      return math.r2(
        this.intensityAdapter(getActiveIntensityScaledByLevel(i, level)) * 100,
        0,
      )
    },
  },

  cargoSweep: {
    id: `cargoSweep`,
    displayName: `Cargo Magnet`,
    description: function (a, level) {
      return `Sweep the immediate area to look for floating cargo (attractor power ${this.displayIntensity(
        a.intensity,
        level,
      )}%).`
    },
    cooldown: crewActiveBaseGlobalCooldown * 4,
    intensityAdapter: (i) => i,
    displayIntensity: function (i, level = 0) {
      return math.r2(
        this.intensityAdapter(getActiveIntensityScaledByLevel(i, level)) * 100,
        0,
      )
    },
  },

  boostShipSightRange: {
    id: `boostShipSightRange`,
    displayName: `Pupil Trilation`,
    description: function (a, level) {
      return `Boost the ship's sight range by ${this.displayIntensity(
        a.intensity,
        level,
      )}% for ${text.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`
    },
    notify: true,
    cooldown: crewActiveBaseGlobalCooldown * 2.5,
    duration: 1000 * 60 * 60 * 1,
    intensityAdapter: (i) => i,
    displayIntensity: function (i, level = 0) {
      return math.r2(
        this.intensityAdapter(getActiveIntensityScaledByLevel(i, level)) * 100,
        0,
      )
    },
  },

  repairDrone: {
    id: `repairDrone`,
    displayName: `NanoRepair Swarm`,
    description: function (a, level) {
      return `Repair ${this.displayIntensity(
        a.intensity,
        level,
      )} health over ${text.msToTimeString(
        this.duration || 1000 * 60 * 60 * 24 * 1,
      )}.`
    },
    cooldown: crewActiveBaseGlobalCooldown * 8,
    duration: 1000 * 60 * 60 * 1,
    notify: true,
    intensityAdapter: (i) => i * 10,
    displayIntensity: function (i, level = 0) {
      return math.r2(
        this.intensityAdapter(getActiveIntensityScaledByLevel(i, level)) *
          constants.displayHPMultiplier,
        0,
      )
    },
  },

  combatDrone: {
    id: `combatDrone`,
    displayName: `Combat Drone`,
    description: function (a, level) {
      return `Deploy a level ${this.displayIntensity(
        a.intensity,
        level,
      )} drone that will attack nearby enemies for ${text.msToTimeString(
        this.duration || 1000 * 60 * 60 * 24 * 1,
      )}.`
    },
    notify: true,
    cooldown: crewActiveBaseGlobalCooldown * 12,
    duration: 1000 * 60 * 60 * 3,
    intensityAdapter: (i) => 1 + Math.floor(i * 4),
    displayIntensity: function (i, level = 0) {
      return this.intensityAdapter(getActiveIntensityScaledByLevel(i, level))
    },
  },

  boostWeaponChargeSpeed: {
    id: `boostWeaponChargeSpeed`,
    displayName: `Weapon Overcharge`,
    description: function (a, level) {
      return `Increase full crew's weapon recharge speed by ${this.displayIntensity(
        a.intensity,
        level,
      )}% for ${text.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`
    },
    notify: true,
    cooldown: crewActiveBaseGlobalCooldown * 11,
    duration: 1000 * 60 * 60 * 3,
    intensityAdapter: (i) => i,
    displayIntensity: function (i, level = 0) {
      return math.r2(
        this.intensityAdapter(getActiveIntensityScaledByLevel(i, level)) * 100,
        0,
      )
    },
  },

  boostStrength: {
    id: `boostStrength`,
    displayName: `Can of Spinach`,
    description: function (a, level) {
      return `Increase strength level by ${this.displayIntensity(
        a.intensity,
        level,
      )} for ${text.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`
    },
    cooldown: crewActiveBaseGlobalCooldown,
    duration: 1000 * 60 * 60 * 3,
    intensityAdapter: (i) => Math.floor(i * 10) + 1,
    displayIntensity: function (i, level = 0) {
      return this.intensityAdapter(getActiveIntensityScaledByLevel(i, level))
    },
  },

  boostDexterity: {
    id: `boostDexterity`,
    displayName: `Adrenaline Shot`,
    description: function (a, level) {
      return `Increase dexterity level by ${this.displayIntensity(
        a.intensity,
        level,
      )} for ${text.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`
    },
    cooldown: crewActiveBaseGlobalCooldown,
    duration: 1000 * 60 * 60 * 3,
    intensityAdapter: (i) => Math.floor(i * 10) + 1,
    displayIntensity: function (i, level = 0) {
      return this.intensityAdapter(getActiveIntensityScaledByLevel(i, level))
    },
  },

  boostIntellect: {
    id: `boostIntellect`,
    displayName: `Neural Steroids`,
    description: function (a, level) {
      return `Increase intellect level by ${this.displayIntensity(
        a.intensity,
        level,
      )} for ${text.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`
    },
    cooldown: crewActiveBaseGlobalCooldown,
    duration: 1000 * 60 * 60 * 3,
    intensityAdapter: (i) => Math.floor(i * 10) + 1,
    displayIntensity: function (i, level = 0) {
      return this.intensityAdapter(getActiveIntensityScaledByLevel(i, level))
    },
  },

  boostCharisma: {
    id: `boostCharisma`,
    displayName: `Charisma Potion`,
    description: function (a, level) {
      return `Increase charisma level by ${this.displayIntensity(
        a.intensity,
        level,
      )} for ${text.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`
    },
    cooldown: crewActiveBaseGlobalCooldown,
    duration: 1000 * 60 * 60 * 3,
    intensityAdapter: (i) => Math.floor(i * 10) + 1,
    displayIntensity: function (i, level = 0) {
      return this.intensityAdapter(getActiveIntensityScaledByLevel(i, level))
    },
  },

  boostMorale: {
    id: `boostMorale`,
    displayName: `Sea Shanty`,
    description: function (a, level) {
      return `Increase the morale of the entire crew by ${this.displayIntensity(
        a.intensity,
        level,
      )}%.`
    },
    notify: true,
    cooldown: crewActiveBaseGlobalCooldown * 2,
    intensityAdapter: (i) => i,
    displayIntensity: function (i, level = 0) {
      return math.r2(
        this.intensityAdapter(getActiveIntensityScaledByLevel(i, level)) * 100,
        0,
      )
    },
  },

  boostThrust: {
    id: `boostThrust`,
    displayName: `Chaaaaarge!`,
    description: function (a, level) {
      return `Increase the thrust of the entire crew by ${this.displayIntensity(
        a.intensity,
        level,
      )}% for ${text.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`
    },
    notify: true,
    intensityAdapter: (i) => i,
    displayIntensity: function (i, level = 0) {
      return math.r2(
        this.intensityAdapter(getActiveIntensityScaledByLevel(i, level)) * 100,
        0,
      )
    },
    cooldown: crewActiveBaseGlobalCooldown * 6,
    duration: 1000 * 60 * 60 * 3,
  },

  boostMineSpeed: {
    id: `boostMineSpeed`,
    displayName: `Canary Song`,
    description: function (a, level) {
      return `Increase the mine speed of the entire crew by ${this.displayIntensity(
        a.intensity,
        level,
      )}% for ${text.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`
    },
    notify: true,
    intensityAdapter: (i) => i,
    displayIntensity: function (i, level = 0) {
      return math.r2(
        this.intensityAdapter(getActiveIntensityScaledByLevel(i, level)) * 100,
        0,
      )
    },
    cooldown: crewActiveBaseGlobalCooldown * 5,
    duration: 1000 * 60 * 60 * 5,
  },
  boostRepairSpeed: {
    id: `boostRepairSpeed`,
    displayName: `Bailout`,
    description: function (a, level) {
      return `Increase the repair speed of the entire crew by ${this.displayIntensity(
        a.intensity,
        level,
      )}% for ${text.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`
    },
    notify: true,
    intensityAdapter: (i) => i,
    displayIntensity: function (i, level = 0) {
      return math.r2(
        this.intensityAdapter(getActiveIntensityScaledByLevel(i, level)) * 100,
        0,
      )
    },
    cooldown: crewActiveBaseGlobalCooldown * 7,
    duration: 1000 * 60 * 60 * 2,
  },
  generalImprovementWhenAlone: {
    id: `generalImprovementWhenAlone`,
    displayName: `Me Time`,
    description: function (a, level) {
      return `Perform ${this.displayIntensity(
        a.intensity,
        level,
      )}% better when alone in a room for ${text.msToTimeString(
        this.duration || 1000 * 60 * 60 * 24 * 1,
      )}.`
    },
    intensityAdapter: (i) => i,
    displayIntensity: function (i, level = 0) {
      return math.r2(
        this.intensityAdapter(getActiveIntensityScaledByLevel(i, level)) * 100,
        0,
      )
    },
    cooldown: crewActiveBaseGlobalCooldown * 3,
    duration: 1000 * 60 * 60 * 4,
  },
  generalImprovementPerCrewMemberInSameRoom: {
    id: `generalImprovementPerCrewMemberInSameRoom`,
    displayName: `F is for Friends`,
    description: function (a, level) {
      return `Perform ${this.displayIntensity(
        a.intensity,
        level,
      )}% better per crew member in the same room for ${text.msToTimeString(
        this.duration || 1000 * 60 * 60 * 24 * 1,
      )}.`
    },
    intensityAdapter: (i) => i,
    displayIntensity: function (i, level = 0) {
      return math.r2(
        this.intensityAdapter(getActiveIntensityScaledByLevel(i, level)) * 100,
        0,
      )
    },
    cooldown: crewActiveBaseGlobalCooldown * 2,
    duration: 1000 * 60 * 60 * 4,
  },
  fullCrewSkillBoost: {
    id: `fullCrewSkillBoost`,
    displayName: `Inspiring Presence`,
    description: function (a, level) {
      return `Increase all skill levels of the whole crew by ${this.displayIntensity(
        a.intensity,
        level,
      )} for ${text.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`
    },
    notify: true,
    intensityAdapter: (i) => Math.floor(i * 2) + 1,
    displayIntensity: function (i, level = 0) {
      return this.intensityAdapter(getActiveIntensityScaledByLevel(i, level))
    },
    cooldown: crewActiveBaseGlobalCooldown * 4,
    duration: 1000 * 60 * 60 * 4,
  },

  flatDamageReduction: {
    id: `flatDamageReduction`,
    displayName: `Shrug it Off`,
    description: function (a, level) {
      return `Reduce all incoming damage by ${this.displayIntensity(
        a.intensity,
        level,
      )} for ${text.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`
    },
    notify: true,
    intensityAdapter: (i) => i * 0.5,
    displayIntensity: function (i, level = 0) {
      return math.r2(
        this.intensityAdapter(getActiveIntensityScaledByLevel(i, level)) *
          constants.displayHPMultiplier,
        0,
      )
    },
    cooldown: crewActiveBaseGlobalCooldown * 10,
    duration: 1000 * 60 * 60 * 7,
  },
  boostChassisAgility: {
    id: `boostChassisAgility`,
    displayName: `Schooling Tactics`,
    description: function (a, level) {
      return `Increase the ship's agility by ${this.displayIntensity(
        a.intensity,
        level,
      )}% for ${text.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`
    },
    notify: true,
    intensityAdapter: (i) => i * 1.2,
    displayIntensity: function (i, level = 0) {
      return math.r2(
        this.intensityAdapter(getActiveIntensityScaledByLevel(i, level)) * 100,
        0,
      )
    },
    cooldown: Number(crewActiveBaseGlobalCooldown),
    duration: 1000 * 60 * 60 * 3,
  },
  seeTrailColors: {
    id: `seeTrailColors`,
    displayName: `On the Hunt`,
    description: function (a, level) {
      return `See the color of all ship trails for ${text.msToTimeString(
        this.duration || 1000 * 60 * 60 * 24 * 1,
      )}.`
    },
    notify: true,
    intensityAdapter: (i) => i,
    displayIntensity: function (i, level = 0) {
      return math.r2(
        this.intensityAdapter(getActiveIntensityScaledByLevel(i, level)) * 100,
        0,
      )
    },
    cooldown: Number(crewActiveBaseGlobalCooldown),
    duration: 1000 * 60 * 60 * 10,
  },
  boostDamageToEngines: {
    id: `boostDamageToEngines`,
    displayName: `Bola Strike`,
    description: function (a, level) {
      return `Increase all damage dealt to enemy engines by ${this.displayIntensity(
        a.intensity,
        level,
      )}% for ${text.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`
    },
    notify: true,
    intensityAdapter: (i) => i,
    displayIntensity: function (i, level = 0) {
      return math.r2(
        this.intensityAdapter(getActiveIntensityScaledByLevel(i, level)) * 100,
        0,
      )
    },
    cooldown: Number(crewActiveBaseGlobalCooldown),
    duration: 1000 * 60 * 60 * 4,
  },
  boostDamageToWeapons: {
    id: `boostDamageToWeapons`,
    displayName: `Disarming Stance`,
    description: function (a, level) {
      return `Increase all damage dealt to enemy weapons by ${this.displayIntensity(
        a.intensity,
        level,
      )}% for ${text.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`
    },
    notify: true,
    intensityAdapter: (i) => i,
    displayIntensity: function (i, level = 0) {
      return math.r2(
        this.intensityAdapter(getActiveIntensityScaledByLevel(i, level)) * 100,
        0,
      )
    },
    cooldown: Number(crewActiveBaseGlobalCooldown),
    duration: 1000 * 60 * 60 * 4,
  },
  boostDamageToScanners: {
    id: `boostDamageToScanners`,
    displayName: `Sand Spray`,
    description: function (a, level) {
      return `Increase all damage dealt to enemy scanners by ${this.displayIntensity(
        a.intensity,
        level,
      )}% for ${text.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`
    },
    notify: true,
    intensityAdapter: (i) => i,
    displayIntensity: function (i, level = 0) {
      return math.r2(
        this.intensityAdapter(getActiveIntensityScaledByLevel(i, level)) * 100,
        0,
      )
    },
    cooldown: Number(crewActiveBaseGlobalCooldown),
    duration: 1000 * 60 * 60 * 4,
  },
  broadcastRangeCargoPrices: {
    id: `broadcastRangeCargoPrices`,
    displayName: `Smooth Talk`,
    description: function (a, level) {
      return `See planet cargo prices within broadcast range for ${text.msToTimeString(
        this.duration || 1000 * 60 * 60 * 24 * 1,
      )}.`
    },
    notify: true,
    intensityAdapter: (i) => i,
    displayIntensity: function (i, level = 0) {
      return math.r2(
        this.intensityAdapter(getActiveIntensityScaledByLevel(i, level)) * 100,
        0,
      )
    },
    cooldown: Number(crewActiveBaseGlobalCooldown),
    duration: 1000 * 60 * 60 * 4,
  },
  damageToAllNearbyEnemies: {
    id: `damageToAllNearbyEnemies`,
    displayName: `Shriek Pulse`,
    description: function (a, level) {
      return `Instantly deal ${this.displayIntensity(
        a.intensity,
        level,
      )} damage to all enemies within ${text.speedNumber(
        this.range || 0.03,
        true,
      )} KM.`
    },
    notify: true,
    intensityAdapter: (i) => i,
    displayIntensity: function (i, level = 0) {
      return math.r2(
        this.intensityAdapter(getActiveIntensityScaledByLevel(i, level)) *
          constants.displayHPMultiplier,
        0,
      )
    },
    cooldown: crewActiveBaseGlobalCooldown * 10,
    range: 0.0802,
  },
}
