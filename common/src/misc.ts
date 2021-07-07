function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
function randomFromArray(array: any[]): any {
  return array[Math.floor(Math.random() * array.length)]
}
function coinFlip() {
  return Math.random() > 0.5
}

function debounce(fn: Function, time = 500) {
  let timeout: NodeJS.Timeout
  return (...params: any[]) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn(...params)
    }, time)
  }
}

function shuffleArray(array: any[]): any[] {
  const toReturn = [...array]
  for (let i = toReturn.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[toReturn[i], toReturn[j]] = [toReturn[j], toReturn[i]]
  }
  return toReturn
}

export default {
  sleep,
  coinFlip,
  randomFromArray,
  debounce,
  shuffleArray,
}
