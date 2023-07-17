import { KeyName, KeyNameIndex } from '@constants/notes'
import { ScaleIndexTable, ScaleName } from '@constants/scales'
import { getMidiNumbersFromKeyScale } from '@libs/midiControl'
import {
  Dispatch,
  MutableRefObject,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'

type GameState = 'INIT' | 'PLAYING' | 'WAIT_FOR_START'

export interface BlockInfo {
  id: string
  key: KeyName
  scaleType: ScaleName
  startNoteIndex: number
  endAt: number
  positionX: number
}

type CandidateChangeHandler = (candidates: any) => void

interface GameContextType {
  gameState: GameState
  setGameState: Dispatch<SetStateAction<GameState>>
  blocks: MutableRefObject<BlockInfo[]>
  refScore: MutableRefObject<number>
  timer: MutableRefObject<number>
  lastBlockDropTime: MutableRefObject<number>
  judgeWithNewKey: (key: KeyName) => void
  candidateScales: MutableRefObject<ScaleName[]>
  setHandleCandidateChange: (handler: CandidateChangeHandler) => void
}

const gameContext = createContext<GameContextType>(null!)

export const useGame = () => {
  return useContext(gameContext)
}

export const GameControlProvider = (props: PropsWithChildren) => {
  const [gameState, setGameState] = useState<GameState>('INIT')
  const blocks = useRef<BlockInfo[]>([])
  const refScore = useRef(0)
  const timer = useRef(0)
  const lastBlockDropTime = useRef(0)

  const compositionKeys = useRef<KeyName[]>([])
  const candidateScales = useRef<ScaleName[]>([])
  const compositionIndexes = useRef<number[]>([])

  const judgeWithNewKey = useCallback(
    (key: KeyName) => {
      const keyIndex = KeyNameIndex[key]

      compositionKeys.current.push(key)
      compositionIndexes.current.push(keyIndex)

      // console.log(keyIndex)

      // find scales that contains current composition keys
      // ScaleIndexTable[key][0]

      handleCandidateChange.current(candidateScales.current)

      // get note indexes from scale and key
      blocks.current.forEach((block) => {
        const indexes = getMidiNumbersFromKeyScale(block.key, block.scaleType)
        // console.log(indexes)
      })
      // find candidates
    },
    [blocks]
  )

  const handleCandidateChange = useRef<CandidateChangeHandler>()
  const setHandleCandidateChange = useCallback(
    (handler: CandidateChangeHandler) => {
      handleCandidateChange.current = handler
    },
    []
  )

  return (
    <gameContext.Provider
      value={{
        gameState: gameState,
        setGameState: setGameState,
        blocks: blocks,
        refScore: refScore,
        timer: timer,
        lastBlockDropTime: lastBlockDropTime,
        judgeWithNewKey: judgeWithNewKey,
        candidateScales: candidateScales,
        setHandleCandidateChange: setHandleCandidateChange,
      }}
    >
      {props.children}
    </gameContext.Provider>
  )
}