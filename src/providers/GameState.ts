import { BlockInfo } from './GameControlProvider'

type BlockGenerator = (time: number) => BlockInfo
interface GameState {
  score: number
  hp: number
  combo: number
  blockGenerators: BlockGenerator[]
}

export const gameState: GameState = {
  score: 0,
  hp: 100,
  combo: 0,
  blockGenerators: [],
}
