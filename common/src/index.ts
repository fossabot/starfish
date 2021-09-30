import globals from './globals'
import math from './math'
import text from './text'
import misc from './misc'
import log from './log'
import game from './game'
import gameConstants from './gameConstants'
import physics from './physics'
import discord from './discord'
import { Profiler } from './Profiler'
import species from './species'
import factions from './factions'
import baseShipPassiveData from './baseShipPassiveData'
import * as cargo from './cargo'
import crewPassives from './crewPassives'
import rooms from './rooms'
import stubify from './stubify'
import * as items from './items'

export default {
  ...globals,
  ...math,
  ...text,
  ...misc,
  ...log,
  ...game,
  ...gameConstants,
  ...physics,
  ...discord,
  items,
  rooms,
  crewPassives,
  cargo,
  species,
  factions,
  baseShipPassiveData,
  Profiler,
  stubify,
}
