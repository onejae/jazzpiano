import { Box, Button, TextField } from '@mui/material'
import React, { useCallback, useState } from 'react'
import { getMidiFromYoutubeLink } from '@services/convertService'
import { NoteEvent } from 'types/midi'
import PianoRoll from '@components/NoteRoll'
import { MidiControlProvider } from '@providers/MidiControl'

type ROLLSTATE = 'INIT' | 'PLAYING'

const YoutubePractice = () => {
  const [youtubeLink, setYoutubeLink] = useState('')
  const [noteEvents, setNoteEvents] = useState<NoteEvent[] | null>(null)
  const [rollState, setRollState] = useState<ROLLSTATE>('INIT')
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

  return (
    <Box display="flex" flexDirection={'column'}>
      <Box display="flex" justifyContent={'center'} padding={2}>
        <TextField
          sx={{ minWidth: 380 }}
          id="standard-basic"
          label="Youtube link"
          value={youtubeLink}
          variant="standard"
          onChange={(e) => {
            setYoutubeLink(e.target.value)
          }}
          InputProps={{
            endAdornment: <Button onClick={handleYoutubeLink}>GET</Button>,
          }}
        />
      </Box>
      <Box flexGrow={1}>
        <MidiControlProvider>
          <PianoRoll noteEvents={noteEvents || []} />
        </MidiControlProvider>
      </Box>
    </Box>
  )
}

export default YoutubePractice
