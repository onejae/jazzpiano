import { Box, Button, TextField } from '@mui/material'
import React, { useCallback, useState } from 'react'
import { getMidiFromYoutubeLink } from '@services/convertService'
import { NoteEvent } from 'types/midi'
import PianoRoll from '@components/PianoRoll'

type ROLLSTATE = 'INIT' | 'PLAYING'

const YoutubePractice = () => {
  const [youtubeLink, setYoutubeLink] = useState('')
  const [noteEvents, setNoteEvents] = useState<NoteEvent[] | null>(null)
  const [rollState, setRollState] = useState<ROLLSTATE>('INIT')
  const handleYoutubeLink = useCallback(async () => {
    try {
      const response = await getMidiFromYoutubeLink({ link: youtubeLink })

      if (response.note_events) {
        setNoteEvents(response.note_events)
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
        <PianoRoll noteEvents={noteEvents || []} />
      </Box>
    </Box>
  )
}

export default YoutubePractice
