import { KeyName, NoteName } from '@constants/notes'
import { ScaleIndexTable, ScaleName } from '@constants/scales'
import { getKeyNamesFromKeyScale } from '@libs/midiControl'
import {
  generateUniqueId,
  getMatchingCount,
  getRandomElement,
  getRandomFloat,
  getRandomInt,
} from '@libs/number'
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

interface ScoreContextType {
  score: number
}

const scoreContext = createContext<ScoreContextType>(null!)

export const useGame = () => {
  return useContext(gameContext)
}

export interface CandidateInfo {
  score: number
  key: KeyName
  scale: ScaleName
  matchCountInScale: number
}

export const GameScoreProvider = (props: PropsWithChildren) => {
  const [playState, setPlayState] = useState<PlayState>('INIT')
  const blocks = useRef<BlockInfo[]>([])
  const refScore = useRef(100)
  const timer = useRef(0)
  const lastBlockDropTime = useRef(0)
  const lastKeyInput = useRef(0)

  const compositionNotes = useRef<NoteName[]>([])
  const candidateScales = useRef<CandidateInfo[]>([])

  const [showLeaderBoard, setShowLeaderBoard] = useState(false)

  useEffect(() => {
    if (playState === 'GAMEOVER') {
      blocks.current = []
    }
  }, [playState])

  useEffect(() => {
    const intervalTimer = setInterval(() => {
      if (timer.current - lastKeyInput.current > 3.5) {
        candidateScales.current = []
        compositionNotes.current = []
        handleCandidateChange.current(candidateScales.current)
      }
    }, 1000)

    return () => clearInterval(intervalTimer)
  }, [])

  const satisfied = (
    candidate: CandidateInfo,
    blockInfo: BlockInfo
  ): boolean => {
    return (
      candidate.score >= ScaleIndexTable[candidate.scale].length &&
      candidate.matchCountInScale >= 8
    )
  }

  const evaluate = useCallback((block: BlockInfo) => {
    let matches = 0
    let matchesWithDups = 0

    if (block.type === 'SCALENORMAL') {
      const keys = getKeyNamesFromKeyScale(block.key, block.scaleType)
      const compositionKeys = compositionNotes.current.map((note) =>
        note.slice(0, -1)
      )

      matches = getMatchingCount(keys, compositionKeys)
      // duplication in a key hallowed
      matchesWithDups = getMatchingCount(compositionKeys, keys)

      // here i am
    } else if (block.type === 'SCALE_WITH_ENTRYNOTE') {
      if (compositionNotes.current.length >= block.noteNumToHit) {
        const lastNotes = compositionNotes.current.slice(-block.noteNumToHit)

        const startKeyName = getKeyNamesFromKeyScale(
          block.key,
          block.scaleType
        )[block.startNoteIndex]
        if (lastNotes[0].slice(0, -1) === startKeyName) {
          const keys = getKeyNamesFromKeyScale(block.key, block.scaleType)
          const compositionKeys = compositionNotes.current.map((note) =>
            note.slice(0, -1)
          )

          matches = getMatchingCount(keys, compositionKeys)
          matchesWithDups = getMatchingCount(compositionKeys, keys)
        }
      }
    }

    return { matches, matchesWithDups }
  }, [])

  const judgeWithNewNote = useCallback(
    (note: NoteName) => {
      compositionNotes.current.push(note)

      compositionNotes.current = compositionNotes.current.slice(-8)
      candidateScales.current = []
      const hits = []

      blocks.current.forEach((block) => {
        const { matches, matchesWithDups } = evaluate(block)

        if (matches >= 5) {
          const candidateScale = {
            score: matches,
            key: block.key,
            scale: block.scaleType,
            matchCountInScale: matchesWithDups,
          }
          candidateScales.current.push(candidateScale)

          if (satisfied(candidateScale, block)) {
            hits.push(candidateScale)
          }
        }
      })

      lastKeyInput.current = timer.current
      candidateScales.current.sort((a, b) => b.score - a.score)

      if (hits.length) {
        handleCandidateHit.current(hits)
        candidateScales.current = []
        compositionNotes.current = []
      }

      handleCandidateChange.current(candidateScales.current)
    },
    [blocks, evaluate]
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
        playState: playState,
        setPlayState: setPlayState,
        blocks: blocks,
        refScore: refScore,
        timer: timer,
        lastBlockDropTime: lastBlockDropTime,
        judgeWithNewNote: judgeWithNewNote,
        candidateScales: candidateScales,
        compositionNotes: compositionNotes,
        setHandleCandidateChange: setHandleCandidateChange,
        setHandleCandidateHit: setHandleCandidateHit,
        showLeaderBoard: showLeaderBoard,
        setShowLeaderBoard: setShowLeaderBoard,
      }}
    >
      {props.children}
    </gameContext.Provider>
  )
}
