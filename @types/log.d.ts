type LogLevel = `low` | `medium` | `high` | `critical`
type LogAlertLevel = LogLevel | `off`
type LogContent =
  | string
  | (string | RichLogContentElement)[]
interface LogEntry {
  time: number
  level: LogLevel
  content: LogContent
}

interface RichLogContentElement {
  text: string
  color?: string
  style?: string
  url?: string
  tooltipData?:
    | string
    | { type: string; [key: string]: any }
}
