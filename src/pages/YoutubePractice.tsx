import { Box, Button, TextField } from '@mui/material'
import { useCallback, useState } from 'react'
import { getMidiFromYoutubeLink } from '@services/convertService'
import { NoteEvent } from 'types/midi'

const YoutubePractice = () => {
  const [youtubeLink, setYoutubeLink] = useState('')
  const [noteEvents, setNoteEvents] = useState<NoteEvent[] | null>(null)
  const handleYoutubeLink = useCallback(async () => {
    try {
      const response = await getMidiFromYoutubeLink({ link: youtubeLink })

      if (response.note_events) {
        setNoteEvents(response.note_events)
      }
    } catch (error) {
      alert(error)
    }
  }, [youtubeLink])
  return (
    <Box>
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
  )
}

export default YoutubePractice
