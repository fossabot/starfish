import globals from './globals'
import math from './math'
import text from './text'
import misc from './misc'
import log from './log'
import game from './game'
import physics from './physics'
import discord from './discord'
import { Profiler } from './Profiler'
import species from './species'

export default {
  ...globals,
  ...math,
  ...text,
  ...misc,
  ...log,
  ...game,
  ...physics,
  ...discord,
  species,
  Profiler,
}
