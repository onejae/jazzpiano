import { createContext, useContext, useState } from 'react'
import { PropsWithChildren } from 'react'

type MidiNoteEventType = (midinumber: number, velocity: number) => any
interface MidiControlContextType {
  handleMidiNoteDown: MidiNoteEventType
  setHandleMidiNoteDown: React.Dispatch<React.SetStateAction<MidiNoteEventType>>
  handleMidiNoteUp: MidiNoteEventType
  setHandleMidiNoteUp: React.Dispatch<React.SetStateAction<MidiNoteEventType>>

  handlePreviewNoteDown: MidiNoteEventType
  setHandlePreviewNoteDown: React.Dispatch<
    React.SetStateAction<MidiNoteEventType>
  >
  handlePreviewNoteUp: MidiNoteEventType
  setHandlePreviewNoteUp: React.Dispatch<
    React.SetStateAction<MidiNoteEventType>
  >

  midiIdx: number
  setMidiIdx: React.Dispatch<React.SetStateAction<number>>
}
const MidiControlContext = createContext<MidiControlContextType>(null!)

const useMidiControl = () => {
  return useContext(MidiControlContext)
}

interface MidiDeviceInfo {
  idx: number
  name: string
}

const MidiControlProvider = (props: PropsWithChildren) => {
  const [handleMidiNoteDown, setHandleMidiNoteDown] =
    useState<MidiNoteEventType>(() => () => {})

  const [handleMidiNoteUp, setHandleMidiNoteUp] = useState<MidiNoteEventType>(
    () => () => {}
  )

  const [handlePreviewNoteDown, setHandlePreviewNoteDown] =
    useState<MidiNoteEventType>(() => () => {})

  const [handlePreviewNoteUp, setHandlePreviewNoteUp] =
    useState<MidiNoteEventType>(() => () => {})

  const [midiIdx, setMidiIdx] = useState(-1)

  return (
    <MidiControlContext.Provider
      value={{
        handleMidiNoteDown: handleMidiNoteDown,
        setHandleMidiNoteDown: setHandleMidiNoteDown,
        handleMidiNoteUp: handleMidiNoteUp,
        setHandleMidiNoteUp: setHandleMidiNoteUp,
        handlePreviewNoteDown: handlePreviewNoteDown,
        setHandlePreviewNoteDown: setHandlePreviewNoteDown,
        handlePreviewNoteUp: handlePreviewNoteUp,
        setHandlePreviewNoteUp: setHandlePreviewNoteUp,
        midiIdx: midiIdx,
        setMidiIdx: setMidiIdx,
      }}
    >
      {props.children}
    </MidiControlContext.Provider>
  )
}

export { useMidiControl, MidiControlProvider }
