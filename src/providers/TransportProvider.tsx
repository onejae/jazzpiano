import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from 'react'

type PlayingState = 'playing' | 'paused' | 'stopped'

interface TransportContextType {
  playingState: PlayingState
  setPlayingState: Dispatch<SetStateAction<PlayingState>>
}

const transportContext = createContext<TransportContextType>(null!)

export const useTransport = () => {
  return useContext(transportContext)
}

export const TransportProvider = (props: PropsWithChildren) => {
  const [playingState, setPlayingState] = useState<PlayingState>('stopped')

  return (
    <transportContext.Provider
      value={{
        playingState: playingState,
        setPlayingState: setPlayingState,
      }}
    >
      {props.children}
    </transportContext.Provider>
  )
}
