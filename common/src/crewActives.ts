import math from './math'
import text from './text'

export const crewActiveBaseGlobalCooldown = 1000 * 60 //* 60 //* 24 * 1

export const crewActives: {
  [key in CrewActiveId]: CrewActiveData
} = {
  instantStamina: {
    id: `instantStamina`,
    displayName: `Sunny Day`,
    description: (p) =>
      `Instantly gain ${math.r2(
        p.intensity * 100,
        0,
      )} stamina.`,
    cooldown: crewActiveBaseGlobalCooldown * 2,
  },

  cargoSweep: {
    id: `cargoSweep`,
    displayName: `Cargo Magnet`,
    description: (p) =>
      `Sweep the immediate area to look for floating cargo (attractor power ${math.r2(
        p.intensity * 100,
        0,
      )}%).`,
    cooldown: crewActiveBaseGlobalCooldown * 3,
  },

  boostShipSightRange: {
    id: `boostShipSightRange`,
    displayName: `Pupil Trilation`,
    description: function (p) {
      return `Boost the ship's sight range by ${math.r2(
        p.intensity * 100,
        0,
      )}% for ${text.msToTimeString(
        this.duration || 1000 * 60 * 60 * 24 * 1,
      )}.`
    },
    notify: true,
    cooldown: crewActiveBaseGlobalCooldown * 2.5,
    duration: 1000 * 60 * 60 * 1,
  },
}
