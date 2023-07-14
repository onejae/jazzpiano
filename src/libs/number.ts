export function getRandomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function getRandomElement<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}
