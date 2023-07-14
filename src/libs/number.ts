export function getRandomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function getRandomElement<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}

export function roundUpToDecimal(value: number, decimalPlaces: number): number {
  const factor = 10 ** decimalPlaces
  return Math.ceil(value * factor) / factor
}

export function generateUniqueId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  )
}
