interface GameState {
  score: number
  hp: number
  combo: number
}

export const gameState: GameState = {
  score: 0,
  hp: 100,
  combo: 0,
}
