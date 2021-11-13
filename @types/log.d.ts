type LogLevel =
  | `low`
  | `medium`
  | `high`
  | `critical`
  | `notify`
type LogAlertLevel = LogLevel | `off`
type LogIcon =
  | `alert`
  | `attack`
  | `cache`
  | `comet`
  | `contract`
  | `crown`
  | `diamond`
  | `die`
  | `fish`
  | `fix`
  | `flag`
  | `fly`
  | `hit`
  | `mine`
  | `money`
  | `mystery`
  | `party`
  | `planet`
  | `ship`
  | `speech`
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
