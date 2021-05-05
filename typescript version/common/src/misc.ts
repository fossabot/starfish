function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
function randomFromArray(array: any[]): any {
  return array[Math.floor(Math.random() * array.length)]
}

export default {
  sleep,
  randomFromArray,
}
