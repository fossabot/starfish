type LogLevel = `low` | `medium` | `high` | `critical`
type LogAlertLevel = LogLevel | `off`
interface LogEntry {
  time: number
  level: LogLevel
  content: string | RichLogContentElement[]
}

interface RichLogContentElement {
  text: string
  color?: string
  style?: string
  url?: string
  tooltipData?: string | { type: string }
}
