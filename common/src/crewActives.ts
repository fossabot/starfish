import math from './math'
import text from './text'
import constants from './gameConstants'
import gameMethods from './game'
import log from './log'

export const crewActiveBaseGlobalCooldown = 1000 * 5 // 60 //* 60 //* 24 * 1

export const crewActives: {
  [key in CrewActiveId]: CrewActiveData
} = {
  instantStamina: {
    id: `instantStamina`,
    displayName: `Sunny Day`,
    description: (a, level) =>
      `Instantly gain ${math.r2(
        gameMethods.getActiveIntensity(a, level) * 100,
        0,
      )} stamina.`,
    cooldown: crewActiveBaseGlobalCooldown * 2,
  },

  cargoSweep: {
    id: `cargoSweep`,
    displayName: `Cargo Magnet`,
    description: (a, level) =>
      `Sweep the immediate area to look for floating cargo (attractor power ${math.r2(
        gameMethods.getActiveIntensity(a, level) * 100,
        0,
      )}%).`,
    cooldown: crewActiveBaseGlobalCooldown * 4,
  },

  boostShipSightRange: {
    id: `boostShipSightRange`,
    displayName: `Pupil Trilation`,
    description: function (a, level) {
      return `Boost the ship's sight range by ${math.r2(
        gameMethods.getActiveIntensity(a, level) * 100,
        0,
      )}% for ${text.msToTimeString(
        this.duration || 1000 * 60 * 60 * 24 * 1,
      )}.`
    },
    notify: true,
    cooldown: crewActiveBaseGlobalCooldown * 2.5,
    duration: 1000 * 60 * 60 * 1,
  },

  repairDrone: {
    id: `repairDrone`,
    displayName: `NanoRepair Swarm`,
    description: function (a, level) {
      return `Repair ${math.r2(
        gameMethods.getActiveIntensity(a, level) *
          constants.displayHPMultiplier,
        0,
      )} health over ${text.msToTimeString(
        this.duration || 1000 * 60 * 60 * 24 * 1,
      )}.`
    },
    cooldown: crewActiveBaseGlobalCooldown * 8,
    duration: 1000 * 60 * 60 * 1,
    notify: true,
  },

  combatDrone: {
    id: `combatDrone`,
    displayName: `Combat Drone`,
    description: function (a, level) {
      return `Deploy a level ${
        1 +
        Math.floor(
          gameMethods.getActiveIntensity(a, level) * 4,
        )
      } drone that will attack nearby enemies for ${text.msToTimeString(
        this.duration || 1000 * 60 * 60 * 24 * 1,
      )}.`
    },
    notify: true,
    cooldown: crewActiveBaseGlobalCooldown * 12,
    duration: 1000 * 60 * 60 * 3,
  },

  weaponRechargeSpeed: {
    id: `weaponRechargeSpeed`,
    displayName: `Weapon Overcharge`,
    description: function (a, level) {
      return `Increase full crew's weapon recharge speed by ${math.r2(
        gameMethods.getActiveIntensity(a, level) * 100,
        0,
      )}% for ${text.msToTimeString(
        this.duration || 1000 * 60 * 60 * 24 * 1,
      )}.`
    },
    notify: true,
    cooldown: crewActiveBaseGlobalCooldown * 11,
    duration: 1000 * 60 * 60 * 3,
  },

  boostStrength: {
    id: `boostStrength`,
    displayName: `Can of Spinach`,
    description: function (a, level) {
      return `Increase strength level by ${math.r2(
        Math.floor(
          gameMethods.getActiveIntensity(a, level) * 4,
        ) + 1,
        0,
      )} for ${text.msToTimeString(
        this.duration || 1000 * 60 * 60 * 24 * 1,
      )}.`
    },
    cooldown: crewActiveBaseGlobalCooldown * 2,
    duration: 1000 * 60 * 60 * 3,
  },

  boostDexterity: {
    id: `boostDexterity`,
    displayName: `Adrenaline Shot`,
    description: function (a, level) {
      return `Increase dexterity level by ${math.r2(
        Math.floor(
          gameMethods.getActiveIntensity(a, level) * 4,
        ) + 1,
        0,
      )} for ${text.msToTimeString(
        this.duration || 1000 * 60 * 60 * 24 * 1,
      )}.`
    },
    cooldown: crewActiveBaseGlobalCooldown * 2,
    duration: 1000 * 60 * 60 * 3,
  },

  boostIntellect: {
    id: `boostIntellect`,
    displayName: `Neural Steroids`,
    description: function (a, level) {
      return `Increase intellect level by ${math.r2(
        Math.floor(
          gameMethods.getActiveIntensity(a, level) * 4,
        ) + 1,
        0,
      )} for ${text.msToTimeString(
        this.duration || 1000 * 60 * 60 * 24 * 1,
      )}.`
    },
    cooldown: crewActiveBaseGlobalCooldown * 2,
    duration: 1000 * 60 * 60 * 3,
  },

  boostCharisma: {
    id: `boostCharisma`,
    displayName: `Charisma Potion`,
    description: function (a, level) {
      return `Increase charisma level by ${math.r2(
        Math.floor(
          gameMethods.getActiveIntensity(a, level) * 4,
        ) + 1,
        0,
      )} for ${text.msToTimeString(
        this.duration || 1000 * 60 * 60 * 24 * 1,
      )}.`
    },
    cooldown: crewActiveBaseGlobalCooldown * 2,
    duration: 1000 * 60 * 60 * 3,
  },

  boostMorale: {
    id: `boostMorale`,
    displayName: `Sea Shanty`,
    description: function (a, level) {
      return `Increase the morale of the entire crew by ${math.r2(
        gameMethods.getActiveIntensity(a, level) * 100,
        0,
      )}%.`
    },
    notify: true,
    cooldown: crewActiveBaseGlobalCooldown * 2,
  },
}
