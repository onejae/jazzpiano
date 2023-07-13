import {
  Dispatch,
  MutableRefObject,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useRef,
  useState,
} from 'react'

type GameState = 'INIT' | 'PLAYING' | 'WAIT_FOR_START'

export interface BlockInfo {
  key: string
  scaleType: string
  startFrom: number
  endAt: number
}

interface GameContextType {
  gameState: GameState
  setGameState: Dispatch<SetStateAction<GameState>>
  blocks: BlockInfo[]
  setBlocks: Dispatch<SetStateAction<BlockInfo[]>>
  timer: MutableRefObject<number>
  lastBlockDropTime: MutableRefObject<number>
}

const gameContext = createContext<GameContextType>(null!)

export const useGame = () => {
  return useContext(gameContext)
}

export const GameControlProvider = (props: PropsWithChildren) => {
  const [gameState, setGameState] = useState<GameState>('INIT')
  const [blocks, setBlocks] = useState<BlockInfo[]>([])
  const timer = useRef(0)
  const lastBlockDropTime = useRef(0)

  return (
    <gameContext.Provider
      value={{
        gameState: gameState,
        setGameState: setGameState,
        blocks: blocks,
        setBlocks: setBlocks,
        timer: timer,
        lastBlockDropTime: lastBlockDropTime,
      }}
    >
      {props.children}
    </gameContext.Provider>
  )
}
