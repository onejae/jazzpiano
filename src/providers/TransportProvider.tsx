import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from 'react'

type PlayingState = 'playing' | 'paused' | 'stopped'
export type PlayingMode = 'preview' | 'standard' | 'step'

interface TransportContextType {
  playingState: PlayingState
  setPlayingState: Dispatch<SetStateAction<PlayingState>>
  playingMode: PlayingMode
  setPlayingMode: Dispatch<SetStateAction<PlayingMode>>
  railAngle: number
  setRailAngle: Dispatch<SetStateAction<number>>
}

const transportContext = createContext<TransportContextType>(null!)

export const useTransport = () => {
  return useContext(transportContext)
}

export const TransportProvider = (props: PropsWithChildren) => {
  const [playingState, setPlayingState] = useState<PlayingState>('stopped')
  const [playingMode, setPlayingMode] = useState<PlayingMode>('preview')
  const [railAngle, setRailAngle] = useState(-1.2)

  return (
    <transportContext.Provider
      value={{
        playingState: playingState,
        setPlayingState: setPlayingState,
        playingMode: playingMode,
        setPlayingMode: setPlayingMode,
        railAngle: railAngle,
        setRailAngle: setRailAngle,
      }}
    >
      {props.children}
    </transportContext.Provider>
  )
}
