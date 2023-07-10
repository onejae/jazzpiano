import { Box } from '@mui/material'
import { useCallback, useState } from 'react'
import { getMidiFromYoutubeLink } from '@services/convertService'
import { NoteEvent } from 'types/midi'
import PianoRoll from '@components/NoteRoll'
import { MidiControlProvider } from '@providers/MidiControl'
import { TransportProvider } from '@providers/TransportProvider'
import { RealPiano } from '@components/RealPiano'
import { AudioDropzone, useAudioDropzone } from '@components/AudioDropzone'

import { Midi, Track } from '@tonejs/midi'
import { EXCLUDE_INSTRUMENT_FAMILIES } from '@constants/midi'

type ROLLSTATE = 'INIT' | 'PLAYING'

const YoutubePractice = () => {
  const { youtubeLink } = useAudioDropzone()
  const [noteEvents, setNoteEvents] = useState<NoteEvent[] | null>(null)
  const [_rollState, setRollState] = useState<ROLLSTATE>('INIT')
  const handleYoutubeLink = useCallback(async () => {
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
  }, [youtubeLink])

  const handleDropFile = useCallback((files: []) => {
    const reader = new FileReader()
    reader.onload = function (e) {
      const buf = e.target.result as ArrayBuffer

      const midi = new Midi(buf)

      midi.tracks.forEach((t: Track) => {
        if (EXCLUDE_INSTRUMENT_FAMILIES.includes(t.instrument.family)) {
          console.log(t.instrument.family)
        }
      })
    }
    reader.readAsArrayBuffer(files[0])
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
