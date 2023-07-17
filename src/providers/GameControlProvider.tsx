import { KeyName, KeyNameIndex } from '@constants/notes'
import { ScaleName } from '@constants/scales'
import { getKeyNamesFromKeyScale } from '@libs/midiControl'
import { getMatchingCount } from '@libs/number'
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
  id: string
  key: KeyName
  scaleType: ScaleName
  startNoteIndex: number
  endAt: number
  positionX: number
}

type CandidateChangeHandler = (candidates: CandidateInfo[]) => void

interface GameContextType {
  gameState: GameState
  setGameState: Dispatch<SetStateAction<GameState>>
  blocks: MutableRefObject<BlockInfo[]>
  refScore: MutableRefObject<number>
  timer: MutableRefObject<number>
  lastBlockDropTime: MutableRefObject<number>
  judgeWithNewKey: (key: KeyName) => void
  candidateScales: MutableRefObject<
    { score: number; key: KeyName; scale: ScaleName }[]
  >
  setHandleCandidateChange: (handler: CandidateChangeHandler) => void
  setHandleCandidateHit: (handler: CandidateChangeHandler) => void
}

const gameContext = createContext<GameContextType>(null!)

export const useGame = () => {
  return useContext(gameContext)
}

export interface CandidateInfo {
  score: number
  key: KeyName
  scale: ScaleName
}

export const GameControlProvider = (props: PropsWithChildren) => {
  const [gameState, setGameState] = useState<GameState>('INIT')
  const blocks = useRef<BlockInfo[]>([])
  const refScore = useRef(0)
  const timer = useRef(0)
  const lastBlockDropTime = useRef(0)
  const lastKeyInput = useRef(0)

  const compositionKeys = useRef<KeyName[]>([])
  const candidateScales = useRef<CandidateInfo[]>([])

  useEffect(() => {
    const intervalTimer = setInterval(() => {
      if (timer.current - lastKeyInput.current > 3.5) {
        candidateScales.current = []
        compositionKeys.current = []
        handleCandidateChange.current(candidateScales.current)
      }
    }, 1000)

    return () => clearInterval(intervalTimer)
  }, [])

  const judgeWithNewKey = useCallback(
    (key: KeyName) => {
      compositionKeys.current.push(key)

      compositionKeys.current = compositionKeys.current.slice(-8)
      candidateScales.current = []
      blocks.current.forEach((block) => {
        const keys = getKeyNamesFromKeyScale(block.key, block.scaleType)

        const matches = getMatchingCount(keys, compositionKeys.current)

        if (matches >= 5) {
          candidateScales.current.push({
            score: matches,
            key: block.key,
            scale: block.scaleType,
          })
        }
      })

      lastKeyInput.current = timer.current
      candidateScales.current.sort((a, b) => b.score - a.score)

      const hits = candidateScales.current.filter((v) => v.score === 7)

      if (hits.length) {
        handleCandidateHit.current(hits)
        candidateScales.current = []
        compositionKeys.current = []
      }

      handleCandidateChange.current(candidateScales.current)
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

  const handleCandidateHit = useRef<CandidateChangeHandler>()
  const setHandleCandidateHit = useCallback(
    (handler: CandidateChangeHandler) => {
      handleCandidateHit.current = handler
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
        setHandleCandidateHit: setHandleCandidateHit,
      }}
    >
      {props.children}
    </gameContext.Provider>
  )
}
