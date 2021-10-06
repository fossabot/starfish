import math from './math'
import globals from './globals'

const maxNameLength = 16

function numberWithCommas(x: number) {
  if (x < 1000) return x
  let negative = false
  if (x < 0) {
    negative = true
    x = -x
  }
  const decimal = x % 1
  const total =
    Math.floor(x)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, `,`) +
    (decimal ? `${math.r2(decimal, 6)}`.substring(1) : ``)
  return (negative ? `-` : ``) + total
}

function speedNumber(
  numberInAu: number,
  noTag = false,
  maxDecimalPlaces = 2,
): string {
  let output = ``
  const numberInKm = numberInAu * globals.kmPerAu
  if (numberInKm < 1000)
    output = `${math.r2(numberInKm, 0)}`
  else if (numberInKm < 1000000)
    output = `${math.r2(numberInKm / 1000, 0)}k`
  else if (numberInKm < 1000000000)
    output = `${math.r2(
      numberInKm / 1000000,
      Math.min(maxDecimalPlaces, 2),
    )}M`
  else
    output = `${math.r2(
      numberInKm / 1000000000,
      Math.min(maxDecimalPlaces, 2),
    )}B`
  return output + (noTag ? `` : ` km/hr`)
}

function printList(list: string[]) {
  if (!list) return ``
  if (list.length === 1) return list[0]
  if (list.length === 2) return `${list[0]} and ${list[1]}`
  return (
    list.slice(0, list.length - 1).join(`, `) +
    `, and ` +
    list[list.length - 1]
  )
}

import { LanguageFilter } from './badwords'
const filter = new LanguageFilter()
const numberEmojis = [
  `0️⃣`,
  `1️⃣`,
  `2️⃣`,
  `3️⃣`,
  `4️⃣`,
  `5️⃣`,
  `6️⃣`,
  `7️⃣`,
  `8️⃣`,
  `9️⃣`,
  `🔟`,
  `🕚`,
  `🕛`,
  `🕐`,
  `🕑`,
  `🕒`,
  `🕓`,
  `🕔`,
  `🕕`,
  `🕖`,
  `🕗`,
  `🕘`,
  `🕙`,
  `🕚`, // 23
]

const directionArrows = [
  `:arrow_right:`,
  `:arrow_upper_right:`,
  `:arrow_up:`,
  `:arrow_upper_left:`,
  `:arrow_left:`,
  `:arrow_lower_left:`,
  `:arrow_down:`,
  `:arrow_lower_right:`,
]
const directionArrowEmoji = [
  `→`,
  `↗`,
  `↑`,
  `↖︎`,
  `←`,
  `↙`,
  `↓`,
  `↘︎`,
]

function degreesToArrow(angle: number): string {
  const normalizedAngle = ((angle + 45 / 2) % 360) / 360
  const arrayIndex = Math.floor(
    normalizedAngle * directionArrows.length,
  )
  return directionArrows[arrayIndex]
}
function degreesToArrowEmoji(angle: number): string {
  const normalizedAngle = ((angle + 45 / 2) % 360) / 360
  const arrayIndex = Math.floor(
    normalizedAngle * directionArrows.length,
  )
  return directionArrowEmoji[arrayIndex]
}

function coordPairToArrow(coordPair: CoordinatePair) {
  return degreesToArrow(math.vectorToDegrees(coordPair))
}

function percentToTextBars(
  percent: number = 0,
  barCount = 10,
): string {
  const bars: string[] = []
  const barGap = 1 / barCount
  for (let i = 0; i < 1; i += 1 / barCount) {
    bars.push(
      Math.max(i - barGap / 2, 0) < percent ? `■` : ` `,
    )
  }
  return `\`` + bars.join(``) + `\``
}

function numberToEmoji(number: number = 0): string {
  return numberEmojis[number] || `❓`
}

function emojiToNumber(emoji: string = ``): number {
  return numberEmojis.findIndex((e) => e === emoji)
}

const skipWords = [
  `a`,
  `an`,
  `the`,
  `of`,
  `in`,
  `to`,
  `per`,
]
function capitalize(string: string = ``): string {
  return (string || ``)
    .split(` `)
    .map((s, index) => {
      if (skipWords.includes(s) && index > 0) return s
      return (
        s.substring(0, 1).toUpperCase() +
        s.substring(1).toLowerCase()
      )
    })
    .join(` `)
}

function sanitize(string: string = ``): SanitizeResult {
  if (!string) string = ``
  string = string.replace(/\n\r\t`/g, ``).trim()
  const withoutURLs = string.replace(
    /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b(?:[-a-zA-Z0-9@:%_+.~#?&//=]*)/gi,
    ``,
  )
  const cleaned = filter.clean(withoutURLs)
  return {
    ok: string === cleaned,
    result: cleaned,
    message:
      string === cleaned
        ? `ok`
        : `Sorry, you can't use language like that here.`,
  }
}

function camelCaseToWords(
  string: string = ``,
  capitalizeFirst?: boolean,
): string {
  let s = string.replace(/([A-Z])/g, ` $1`)
  if (capitalizeFirst)
    s = s.replace(/^./, (str) => str.toUpperCase())
  return s
}

function acronym(string: string = ``): string {
  return string
    .replace(/[^a-z A-Z]/g, ``)
    .split(` `)
    .map((s) => {
      if (skipWords.includes(s.toLowerCase())) return ``
      return s.substring(0, 1)
    })
    .filter((w) => w)
    .join(``)
    .toUpperCase()
}

function msToTimeString(ms: number = 0): string {
  let remainingSeconds = Math.floor(ms / 1000)

  let years: any = Math.floor(
    remainingSeconds / (60 * 60 * 24 * 365),
  )
  remainingSeconds -= years * 60 * 60 * 24 * 365

  let days: any = Math.floor(
    remainingSeconds / (60 * 60 * 24),
  )
  remainingSeconds -= days * 60 * 60 * 24

  let hours: any = Math.floor(remainingSeconds / (60 * 60))
  remainingSeconds -= hours * 60 * 60

  let minutes: any = Math.floor(remainingSeconds / 60)
  remainingSeconds -= minutes * 60
  if (minutes < 10 && hours > 0) minutes = `0${minutes}`

  let seconds: any = remainingSeconds
  if (seconds < 10) seconds = `0${seconds}`

  if (!years && !days && !hours && !minutes)
    return `${seconds}s`
  if (!years && !days && !hours)
    return `${minutes}m ${seconds}s`
  if (!years && !days) return `${hours}h ${minutes}m`
  if (!years) return `${days}d ${hours}h`
  return `${years}y ${days}d`
}

const possibleRandomCharacters: string = `ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz1234567890.,$%&*-?!'🚀⚡️📣🙏💳🪐💪🌏🛸🌌🔧🎉🧭📍🔥🛠📦📡⏱😀☠️👍👎🖕👀 あいうえおるった月火水木金土월화수목금토일`

function garble(string: string = ``, percent = 0): string {
  if (percent > 0.98) percent = 0.98
  let splitString: string[] = string.split(` `)

  // move words around
  while (Math.random() < percent * 0.8) {
    arrayMove(
      splitString,
      Math.floor(splitString.length * Math.random()),
      Math.floor(splitString.length * Math.random()),
    )
  }

  if (percent > 0.1) {
    // move letters around
    splitString = splitString.map((word: string) => {
      let characters: string[] = word.split(``)
      while (Math.random() < percent * 0.6) {
        arrayMove(
          characters,
          Math.floor(characters.length * Math.random()),
          Math.floor(characters.length * Math.random()),
        )
      }

      if (percent > 0.3) {
        // randomize letters
        characters = characters.map((char: string) => {
          if (Math.random() < percent * 0.4) {
            char = possibleRandomCharacters.charAt(
              Math.floor(
                Math.random() *
                  possibleRandomCharacters.length,
              ),
            )
          }
          return char
        })
      }
      return characters.join(``)
    })
  }
  return splitString.join(` `)
}
function arrayMove(
  arr: any[],
  oldIndex: number,
  newIndex: number,
): void {
  if (!Array.isArray(arr) || !arr.length) return
  if (newIndex >= arr.length) {
    let k = newIndex - arr.length + 1
    while (k--) {
      arr.push(undefined)
    }
  }
  arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0])
}

export default {
  maxNameLength,
  numberWithCommas,
  speedNumber,
  printList,
  degreesToArrow,
  degreesToArrowEmoji,
  coordPairToArrow,
  percentToTextBars,
  numberToEmoji,
  emojiToNumber,
  capitalize,
  camelCaseToWords,
  sanitize,
  msToTimeString,
  garble,
  acronym,
}
