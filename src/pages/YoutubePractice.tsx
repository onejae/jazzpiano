import { Box } from '@mui/material'
import { useCallback, useState } from 'react'
import {
  getMidiFromYoutubeLink,
  getNoteEventsFromTonejs,
} from '@services/convertService'
import { NoteEvent } from 'types/midi'
import PianoRoll from '@components/NoteRoll'
import { MidiControlProvider } from '@providers/MidiControl'
import { TransportProvider } from '@providers/TransportProvider'
import { RealPiano } from '@components/RealPiano'
import { AudioDropzone } from '@components/AudioDropzone'

import { Midi } from '@tonejs/midi'

type ROLLSTATE = 'INIT' | 'PLAYING'

const YoutubePractice = () => {
  const [noteEvents, setNoteEvents] = useState<NoteEvent[] | null>(null)
  const [_rollState, setRollState] = useState<ROLLSTATE>('INIT')
  const handleYoutubeLink = useCallback(async (youtubeLink: string) => {
    try {
      const response = await getMidiFromYoutubeLink({ link: youtubeLink })

      if (response.note_events) {
        // just for debugging
        const noteEventsSorted = response.note_events.sort((a, b) => {
          if (a[0] > b[0]) return 1
          else if (a[0] === b[0]) return 0
          else return -1
        })

        const noteEventFiltered = noteEventsSorted.filter((v) => v[2] >= 40)

        setNoteEvents(noteEventFiltered)
        setRollState('PLAYING')
      }
    } catch (error) {
      alert(error)
    }
  }, [])

  const handleDropFile = useCallback((files: any[]) => {
    const reader = new FileReader()
    reader.onload = function (e) {
      const buf = e.target.result as ArrayBuffer

      const midi = new Midi(buf)

      const noteEvents = getNoteEventsFromTonejs(midi)

      setNoteEvents(noteEvents)
    }
    if (files.length > 0) reader.readAsArrayBuffer(files[0])
  }, [])

  return (
    <Box display="flex" flexDirection={'column'}>
      <Box flexGrow={1}>
        <AudioDropzone
          onDrop={handleDropFile}
          onYoutubeLink={handleYoutubeLink}
        />
        <TransportProvider>
          <MidiControlProvider>
            <PianoRoll noteEvents={noteEvents || []} />
            <RealPiano />
          </MidiControlProvider>
        </TransportProvider>
      </Box>
    </Box>
  )
}

export default YoutubePractice
