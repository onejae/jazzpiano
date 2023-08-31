import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  MutableRefObject,
} from 'react'
import { PropsWithChildren } from 'react'

type MidiNoteEventHandlerType = (midinumber: number, velocity: number) => any
interface MidiControlContextType {
  refHandleMidiNoteDown: MutableRefObject<MidiNoteEventHandlerType>
  setHandleMidiNoteDown: (handler: MidiNoteEventHandlerType) => void
  refHandleMidiNoteUp: MutableRefObject<MidiNoteEventHandlerType>
  setHandleMidiNoteUp: (handler: MidiNoteEventHandlerType) => void

  refHandlePreviewNoteDown: MutableRefObject<MidiNoteEventHandlerType>
  setHandlePreviewNoteDown: (handler: MidiNoteEventHandlerType) => void
  refHandlePreviewNoteUp: MutableRefObject<MidiNoteEventHandlerType>
  setHandlePreviewNoteUp: (handler: MidiNoteEventHandlerType) => void

  midiIdx: number
  setMidiIdx: React.Dispatch<React.SetStateAction<number>>
}
const MidiControlContext = createContext<MidiControlContextType>(null!)

const useMidiControl = () => {
  return useContext(MidiControlContext)
}

const MidiControlProvider = (props: PropsWithChildren) => {
  const refHandleMidiNoteDown = useRef<MidiNoteEventHandlerType>()
  const setHandleMidiNoteDown = useCallback(
    (handler: MidiNoteEventHandlerType) => {
      refHandleMidiNoteDown.current = handler
    },
    []
  )

  const refHandleMidiNoteUp = useRef<MidiNoteEventHandlerType>()
  const setHandleMidiNoteUp = useCallback(
    (handler: MidiNoteEventHandlerType) => {
      refHandleMidiNoteUp.current = handler
    },
    []
  )
  // const [handleMidiNoteDown, setHandleMidiNoteDown] =
  // useState<MidiNoteEventType>(() => () => {})

  // const [handleMidiNoteUp, setHandleMidiNoteUp] = useState<MidiNoteEventType>(
  //   () => () => {}
  // )

  const refHandlePreviewNoteDown = useRef<MidiNoteEventHandlerType>()
  const setHandlePreviewNoteDown = useCallback(
    (handler: MidiNoteEventHandlerType) => {
      refHandlePreviewNoteDown.current = handler
    },
    []
  )

  const refHandlePreviewNoteUp = useRef<MidiNoteEventHandlerType>()
  const setHandlePreviewNoteUp = useCallback(
    (handler: MidiNoteEventHandlerType) => {
      refHandlePreviewNoteUp.current = handler
    },
    []
  )

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
