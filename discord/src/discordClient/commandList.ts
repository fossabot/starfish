import c from '../../../common/dist'
import { Command, CommandStub } from './models/Command'

import StartCommand from './commands/Start'
import LinkCommand from './commands/Link'
import JoinCommand from './commands/Join'
import RespawnCommand from './commands/Respawn'
import RepairChannelsCommand from './commands/RepairChannels'
import BroadcastCommand from './commands/Broadcast'
import AlertLevelCommand from './commands/AlertLevel'
import ChangeCaptainCommand from './commands/ChangeCaptain'
import HelpCommand from './commands/Help'
import KickMemberCommand from './commands/KickMember'
import ShipLeaveGameCommand from './commands/ShipLeaveGame'
import GoCommand from './commands/Go'
import ChangeShipNameCommand from './commands/ShipName'
import ThrustCommand from './commands/Thrust'
import BrakeCommand from './commands/Brake'
import StatusCommand from './commands/Status'
import RepairCommand from './commands/Repair'
import BunkCommand from './commands/Bunk'
import WeaponsCommand from './commands/Weapons'
import MineCommand from './commands/Mine'
import CockpitCommand from './commands/Cockpit'
import LabCommand from './commands/Lab'
import BuyCommand from './commands/Buy'
import SellCommand from './commands/Sell'
import CrewLeaveGameCommand from './commands/CrewLeaveGame'
import ContributeToCommonFundCommand from './commands/DonateToCommonFund'

const commands: Command[] = []

const commandClasses: CommandStub[] = [
  HelpCommand,
  StartCommand,
  JoinCommand,
  LinkCommand,
  StatusCommand,
  BroadcastCommand,
  GoCommand,
  ThrustCommand,
  BrakeCommand,
  BuyCommand,
  SellCommand,
  RepairCommand,
  BunkCommand,
  WeaponsCommand,
  MineCommand,
  CockpitCommand,
  LabCommand,
  ContributeToCommonFundCommand,
  RespawnCommand,
  ChangeShipNameCommand,
  AlertLevelCommand,
  ChangeCaptainCommand,
  KickMemberCommand,
  RepairChannelsCommand,
  ShipLeaveGameCommand,
  CrewLeaveGameCommand,
]
commandClasses.forEach((commandStub: CommandStub) => {
  commands.push(new Command(commandStub))
})

export default commands
