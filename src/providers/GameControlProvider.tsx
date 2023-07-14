import { KeyName } from '@constants/notes'
import { ScaleName } from '@constants/scales'
import {
  Dispatch,
  MutableRefObject,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

type GameState = 'INIT' | 'PLAYING' | 'WAIT_FOR_START'

export interface BlockInfo {
  key: KeyName
  scaleType: ScaleName
  startNoteIndex: number
  endAt: number
  positionX: number
}

interface GameContextType {
  gameState: GameState
  setGameState: Dispatch<SetStateAction<GameState>>
  blocks: BlockInfo[]
  setBlocks: Dispatch<SetStateAction<BlockInfo[]>>
  timer: MutableRefObject<number>
  lastBlockDropTime: MutableRefObject<number>
  judgeWithNewKey: (key: KeyName) => void
}

const gameContext = createContext<GameContextType>(null!)

export const useGame = () => {
  return useContext(gameContext)
}

const getNoteIndexesFromKeyScale = (
  key: KeyName,
  scale: ScaleName
): number[] => {
  return []
}

export const GameControlProvider = (props: PropsWithChildren) => {
  const [gameState, setGameState] = useState<GameState>('INIT')
  const [blocks, setBlocks] = useState<BlockInfo[]>([])
  const timer = useRef(0)
  const lastBlockDropTime = useRef(0)

  // const [compositionKeys, setCompositionKeys] = useState<KeyName[]>([])
  const compositionKeys = useRef<KeyName[]>([])
  const [candidateScales, setCandidateScales] = useState<ScaleName[]>([])

  const judgeWithNewKey = useCallback(
    (key: KeyName) => {
      compositionKeys.current.push(key)

      // get note indexes from scale and key
      blocks.forEach((block) => {
        const indexes = getNoteIndexesFromKeyScale(block.key, block.scaleType)
      })
      // find candidates
    },
    [blocks]
  )

  return (
    <gameContext.Provider
      value={{
        gameState: gameState,
        setGameState: setGameState,
        blocks: blocks,
        setBlocks: setBlocks,
        timer: timer,
        lastBlockDropTime: lastBlockDropTime,
        judgeWithNewKey: judgeWithNewKey,
      }}
    >
      {props.children}
    </gameContext.Provider>
  )
}
