import { useMidiControl } from '@providers/MidiControl'
import { useEffect } from 'react'
import { NoteMessageEvent, WebMidi } from 'webmidi'

export const RealPiano = () => {
  const {
    refHandleMidiNoteDown,
    refHandleMidiNoteUp,
    refHandlePreviewNoteDown,
    refHandlePreviewNoteUp,
  } = useMidiControl()

  useEffect(() => {
    WebMidi.enable({
      callback: (err) => {
        if (err) {
          console.error('WebMidi could not be enabled.', err)
        } else {
          console.log('WebMidi enabled!')
        }
      },
    }).then(() => {
      WebMidi.addListener('connected', function () {
        WebMidi.inputs.forEach((input) => {
          input.removeListener('noteon')
          input.addListener(
            'noteon',
            (e: NoteMessageEvent & { data: number[] }) => {
              const midiNumber = e.data[1]
              const velocity = e.data[2]
              if (refHandleMidiNoteDown.current)
                refHandleMidiNoteDown.current(midiNumber, velocity)
              if (refHandlePreviewNoteDown.current)
                refHandlePreviewNoteDown.current(midiNumber, velocity)
            }
          )

          input.removeListener('noteoff')
          input.addListener(
            'noteoff',
            (e: NoteMessageEvent & { data: number[] }) => {
              const midiNumber = e.data[1]
              const velocity = e.data[2]
              if (refHandleMidiNoteUp.current)
                refHandleMidiNoteUp.current(midiNumber, velocity)
              if (refHandlePreviewNoteUp.current)
                refHandlePreviewNoteUp.current(midiNumber, velocity)
            }
          )
        })
      })
    })

    return () => {
      WebMidi.inputs.forEach((input) => {
        input.removeListener('noteon')
        input.removeListener('noteoff')
      })
      WebMidi.disable().then()
    }
  }, [
    refHandleMidiNoteDown,
    refHandleMidiNoteUp,
    refHandlePreviewNoteDown,
    refHandlePreviewNoteUp,
  ])

  return <></>
}
