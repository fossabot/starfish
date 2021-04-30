function randomFromArray(array: any[]): any {
  return array[Math.floor(Math.random() * array.length)]
}

export default {
  randomFromArray,
}
