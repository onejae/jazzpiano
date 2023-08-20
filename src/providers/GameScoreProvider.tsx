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
import axios from 'axios'
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

interface ScoreRow {
  name: string
  score: number
}

interface ScoreContextType {
  ranks: ScoreRow[]
  getRanks: () => Promise<ScoreRow[]>
}

const scoreContext = createContext<ScoreContextType>(null!)

export const useScore = () => {
  return useContext(scoreContext)
}

export const GameScoreProvider = (props: PropsWithChildren) => {
  const [ranks, setRanks] = useState<ScoreRow[]>([])

  const fetchScore = useCallback(async () => {
    const ranks = await axios.get('/ranks/')

    setRanks(ranks.data)

    return ranks.data
  }, [])

  return (
    <scoreContext.Provider
      value={{
        ranks: ranks,
        getRanks: fetchScore,
      }}
    >
      {props.children}
    </scoreContext.Provider>
  )
}
