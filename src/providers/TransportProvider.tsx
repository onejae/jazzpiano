import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from 'react'

type PlayingState = 'playing' | 'paused' | 'stopped'
type PlayingMode = 'preview' | 'standard' | 'step'

interface TransportContextType {
  playingState: PlayingState
  setPlayingState: Dispatch<SetStateAction<PlayingState>>
  playingMode: PlayingMode
  setPlayingMode: Dispatch<SetStateAction<PlayingMode>>
}

const transportContext = createContext<TransportContextType>(null!)

export const useTransport = () => {
  return useContext(transportContext)
}

export const TransportProvider = (props: PropsWithChildren) => {
  const [playingState, setPlayingState] = useState<PlayingState>('stopped')
  const [playingMode, setPlayingMode] = useState<PlayingMode>('step')

  return (
    <transportContext.Provider
      value={{
        playingState: playingState,
        setPlayingState: setPlayingState,
        playingMode: playingMode,
        setPlayingMode: setPlayingMode,
      }}
    >
      {props.children}
    </transportContext.Provider>
  )
}
