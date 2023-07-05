import { createContext, useContext, useState } from 'react'
import { PropsWithChildren } from 'react'

interface MidiControlContextType {
  handleNoteDown: (midiNumber: number) => any
  setHandleNoteDown: React.Dispatch<
    React.SetStateAction<(midiNumber: number) => any>
  >
  handleNoteUp: (midiNumber: number) => any
  setHandleNoteUp: React.Dispatch<
    React.SetStateAction<(midiNumber: number) => any>
  >
}
const MidiControlContext = createContext<MidiControlContextType>(null!)

const useMidiControl = () => {
  return useContext(MidiControlContext)
}

const MidiControlProvider = (props: PropsWithChildren) => {
  const [handleNoteDown, setHandleNoteDown] = useState<
    (midiNumber: number) => any
  >(() => () => {})

  const [handleNoteUp, setHandleNoteUp] = useState<(midiNumber: number) => any>(
    () => () => {}
  )

  return (
    <MidiControlContext.Provider
      value={{
        handleNoteDown: handleNoteDown,
        setHandleNoteDown: setHandleNoteDown,
        handleNoteUp: handleNoteUp,
        setHandleNoteUp: setHandleNoteUp,
      }}
    >
      {props.children}
    </MidiControlContext.Provider>
  )
}

export { useMidiControl, MidiControlProvider }
