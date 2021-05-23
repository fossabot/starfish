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

export default {
  sleep,
  coinFlip,
  randomFromArray,
}
