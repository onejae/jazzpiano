import axios from 'axios'
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
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

    console.log(ranks)

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
