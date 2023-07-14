import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  MutableRefObject,
} from 'react'
import { PropsWithChildren } from 'react'

type MidiNoteEventType = (midinumber: number, velocity: number) => any
interface MidiControlContextType {
  refHandleMidiNoteDown: MutableRefObject<MidiNoteEventType>
  setHandleMidiNoteDown: (handler: MidiNoteEventType) => void
  refHandleMidiNoteUp: MutableRefObject<MidiNoteEventType>
  setHandleMidiNoteUp: (handler: MidiNoteEventType) => void

  refHandlePreviewNoteDown: MutableRefObject<MidiNoteEventType>
  setHandlePreviewNoteDown: (handler: MidiNoteEventType) => void
  refHandlePreviewNoteUp: MutableRefObject<MidiNoteEventType>
  setHandlePreviewNoteUp: (handler: MidiNoteEventType) => void

  midiIdx: number
  setMidiIdx: React.Dispatch<React.SetStateAction<number>>
}
const MidiControlContext = createContext<MidiControlContextType>(null!)

const useMidiControl = () => {
  return useContext(MidiControlContext)
}

const MidiControlProvider = (props: PropsWithChildren) => {
  const refHandleMidiNoteDown = useRef<MidiNoteEventType>()
  const setHandleMidiNoteDown = useCallback((handler: MidiNoteEventType) => {
    refHandleMidiNoteDown.current = handler
  }, [])

  const refHandleMidiNoteUp = useRef<MidiNoteEventType>()
  const setHandleMidiNoteUp = useCallback((handler: MidiNoteEventType) => {
    refHandleMidiNoteUp.current = handler
  }, [])
  // const [handleMidiNoteDown, setHandleMidiNoteDown] =
  // useState<MidiNoteEventType>(() => () => {})

  // const [handleMidiNoteUp, setHandleMidiNoteUp] = useState<MidiNoteEventType>(
  //   () => () => {}
  // )

  const refHandlePreviewNoteDown = useRef<MidiNoteEventType>()
  const setHandlePreviewNoteDown = useCallback((handler: MidiNoteEventType) => {
    refHandlePreviewNoteDown.current = handler
  }, [])

  const refHandlePreviewNoteUp = useRef<MidiNoteEventType>()
  const setHandlePreviewNoteUp = useCallback((handler: MidiNoteEventType) => {
    refHandlePreviewNoteUp.current = handler
  }, [])

  // const [handlePreviewNoteDown, setHandlePreviewNoteDown] =
  // useState<MidiNoteEventType>(() => () => {})

  // const [handlePreviewNoteUp, setHandlePreviewNoteUp] =
  // useState<MidiNoteEventType>(() => () => {})

  const [midiIdx, setMidiIdx] = useState(-1)

  return (
    <MidiControlContext.Provider
      value={{
        refHandleMidiNoteDown: refHandleMidiNoteDown,
        setHandleMidiNoteDown: setHandleMidiNoteDown,
        refHandleMidiNoteUp: refHandleMidiNoteUp,
        setHandleMidiNoteUp: setHandleMidiNoteUp,
        refHandlePreviewNoteDown: refHandlePreviewNoteDown,
        setHandlePreviewNoteDown: setHandlePreviewNoteDown,
        refHandlePreviewNoteUp: refHandlePreviewNoteUp,
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
