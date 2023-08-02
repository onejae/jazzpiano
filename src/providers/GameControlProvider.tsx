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

type PlayState = 'INIT' | 'PLAYING' | 'GAMEOVER'

type BlockType = 'SCALENORMAL' | 'SCALE_WITH_ENTRYNOTE'

export interface BlockInfo {
  id: string
  key: KeyName
  type: BlockType
  scaleType: ScaleName
  noteNumToHit?: number
  startNoteIndex: number
  endAt: number
  positionX: number
}

type CandidateChangeHandler = (candidates: CandidateInfo[]) => void

const keyNames: KeyName[] = [
  'C',
  'C#',
  'Db',
  'D',
  'D#',
  'Eb',
  'E',
  'F',
  'F#',
  'Gb',
  'G',
  'G#',
  'Ab',
  'A',
  'A#',
  'Bb',
]

const scaleNames = Object.keys(ScaleIndexTable)

export const generateNormalScaleBlock = (time: number): BlockInfo => {
  const newBlock: BlockInfo = {
    id: generateUniqueId(),
    key: getRandomElement(keyNames),
    scaleType: getRandomElement(scaleNames) as ScaleName,
    startNoteIndex: 0,
    endAt: 15 + time,
    positionX: getRandomFloat(-13, 13),
    noteNumToHit: 8,
    type: 'SCALENORMAL',
  }

  return newBlock
}

export const generateScaleBlockWithEntryNote = (time: number): BlockInfo => {
  const scale = getRandomElement(scaleNames) as ScaleName
  const newBlock: BlockInfo = {
    id: generateUniqueId(),
    key: getRandomElement(keyNames),
    scaleType: scale,
    startNoteIndex: getRandomInt(0, ScaleIndexTable[scale].length),
    endAt: 15 + time,
    positionX: getRandomFloat(-13, 13),
    noteNumToHit: 8,
    type: 'SCALE_WITH_ENTRYNOTE',
  }

  return newBlock
}

interface GameContextType {
  playState: PlayState
  setPlayState: Dispatch<SetStateAction<PlayState>>
  blocks: MutableRefObject<BlockInfo[]>
  refScore: MutableRefObject<number>
  timer: MutableRefObject<number>
  lastBlockDropTime: MutableRefObject<number>
  judgeWithNewNote: (note: NoteName) => void
  candidateScales: MutableRefObject<
    { score: number; key: KeyName; scale: ScaleName }[]
  >
  compositionNotes: MutableRefObject<NoteName[]>
  setHandleCandidateChange: (handler: CandidateChangeHandler) => void
  setHandleCandidateHit: (handler: CandidateChangeHandler) => void
  showLeaderBoard: boolean
  setShowLeaderBoard: Dispatch<SetStateAction<boolean>>
}

const gameContext = createContext<GameContextType>(null!)

export const useGame = () => {
  return useContext(gameContext)
}

export interface CandidateInfo {
  score: number
  key: KeyName
  scale: ScaleName
  matchCountInScale: number
}

export const GameControlProvider = (props: PropsWithChildren) => {
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

      // const hits = candidateScales.current.filter(
      //   (v) =>
      //     v.score === ScaleIndexTable[v.scale].length &&
      //     v.matchCountInScale === 8
      // )

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
