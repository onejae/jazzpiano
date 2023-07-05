import React, { createContext, useContext, useState } from 'react'
import { PropsWithChildren } from 'react'

interface MidiControlContextType {
  handleNoteDown: (midiNumber: number) => any
  setHandleNoteDown: React.Dispatch<
    React.SetStateAction<(midiNumber: number) => any>
  >
}
const MidiControlContext = createContext<MidiControlContextType>(null)

const useMidiControl = () => {
  return useContext(MidiControlContext)
}

const MidiControlProvider = (props: PropsWithChildren) => {
  const [handleNoteDown, setHandleNoteDown] = useState<
    (midiNumber: number) => any
  >(() => () => {})

  return (
    <MidiControlContext.Provider
      value={{
        handleNoteDown: handleNoteDown,
        setHandleNoteDown: setHandleNoteDown,
      }}
    >
      {props.children}
    </MidiControlContext.Provider>
  )
}

export { useMidiControl, MidiControlProvider }
