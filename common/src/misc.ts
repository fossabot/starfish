function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
function randomFromArray(array: any[]): any {
  return array[Math.floor(Math.random() * array.length)]
}

function randomWithWeights<E>(
  elements: { weight: number; value: E }[],
): E {
  const total: number = elements.reduce(
    (total, e) => e.weight + total,
    0,
  )
  const random = Math.random() * total
  let currentCount = 0
  for (let i = 0; i < elements.length; i++) {
    currentCount += elements[i].weight
    if (currentCount >= random) return elements[i].value
  }
  console.log(`failed to get weighted random value`)
  return elements[0]?.value
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
  randomWithWeights,
  debounce,
  shuffleArray,
}
