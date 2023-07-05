import { useState } from 'react'

const useMidiControl = () => {
  const [handleNoteDown, setHandleNoteDown] = useState<
    ((midiNumber: number) => any) | undefined
  >(undefined)

  const [handleNoteUp, setHandleNoteUp] = useState<
    ((midiNumber: number) => any) | undefined
  >(undefined)

  console.log('--------------------dsu')
  return { handleNoteDown, setHandleNoteDown, handleNoteUp, setHandleNoteUp }
}

export { useMidiControl }
