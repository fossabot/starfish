import species from './species'
type SpacecrabGuildKey = `fowls`
interface SpacecrabBaseGuildData {
  name: string
  id: SpacecrabGuildKey
  color: string
  aiOnly: undefined | true
  passives: ShipPassiveEffect[]
}

// trader, hunter, miner, explorer, peacekeeper,

const guilds: {
  [key in SpacecrabGuildKey]: SpacecrabBaseGuildData
} = {
  fowls: {
    name: `Fowls`,
    id: `fowls`,
    color: `hsl(0, 60%, 50%)`,
    aiOnly: true,
    passives: [],
  },
}

export default guilds
