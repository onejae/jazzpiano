import { useMidiControl } from '@providers/MidiControl'
import { useEffect } from 'react'
import { NoteMessageEvent, WebMidi } from 'webmidi'

export const RealPiano = () => {
  const {
    handleMidiNoteDown,
    handleMidiNoteUp,
    handlePreviewNoteDown,
    handlePreviewNoteUp,
  } = useMidiControl()

  useEffect(() => {
    WebMidi.enable((err) => {
      if (err) {
        console.error('WebMidi could not be enabled.', err)
      } else {
        console.log('WebMidi enabled!')
      }
    }).then(() => {})

    return () => {
      WebMidi.disable()
    }
  }, [])

  useEffect(() => {
    WebMidi.inputs.forEach((input) => {
      input.addListener('noteon', (e: NoteMessageEvent) => {
        const midiNumber = e.data[1]
        const velocity = e.data[2]
        if (handleMidiNoteDown) handleMidiNoteDown(midiNumber, velocity)
        if (handlePreviewNoteDown) handlePreviewNoteDown(midiNumber, velocity)
      })
      input.addListener('noteoff', (e: NoteMessageEvent) => {
        const midiNumber = e.data[1]
        const velocity = e.data[2]
        if (handleMidiNoteUp) handleMidiNoteUp(midiNumber, velocity)
        if (handlePreviewNoteUp) handlePreviewNoteUp(midiNumber, velocity)
      })
    })

    return () => {}
  }, [
    handleMidiNoteDown,
    handleMidiNoteUp,
    handlePreviewNoteDown,
    handlePreviewNoteUp,
  ])
}