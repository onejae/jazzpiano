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

export function getMatchingCount(arr1: any[], arr2: any[]): number {
  return arr1.filter((item) => arr2.includes(item)).length
}
