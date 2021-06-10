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

export default {
  sleep,
  coinFlip,
  randomFromArray,
  debounce,
}
