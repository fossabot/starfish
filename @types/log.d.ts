type LogLevel =
  | `low`
  | `medium`
  | `high`
  | `critical`
  | `notify`
type LogAlertLevel = LogLevel | `off`
type LogIcon =
  | `ability`
  | `alert`
  | `arrive`
  | `brake`
  | `cache`
  | `comet`
  | `contractStart`
  | `contractStolen`
  | `contractCompleted`
  | `crown`
  | `depart`
  | `diamond`
  | `die`
  | `discovery`
  | `fish`
  | `fix`
  | `flag`
  | `incomingAttackCrit`
  | `incomingAttackDisable`
  | `incomingAttackHit`
  | `incomingAttackMiss`
  | `kill`
  | `mine`
  | `moneyGained`
  | `moneySpent`
  | `mystery`
  | `outgoingAttackCrit`
  | `outgoingAttackDisable`
  | `outgoingAttackHit`
  | `outgoingAttackMiss`
  | `party`
  | `planet`
  | `ship`
  | `sellItem`
  | `speech`
  | `thrust`
  | `warning`
  | `zone`
type LogContent =
  | string
  | (string | RichLogContentElement)[]
interface LogEntry {
  time: number
  level: LogLevel
  content: LogContent
  icon?: LogIcon
  isGood?: boolean
}

interface RichLogContentElement {
  text: string
  discordOnly?: boolean
  color?: string
  style?: string
  url?: string
  tooltipData?:
    | string
    | { type: string; [key: string]: any }
}
