import { Box, TextField } from '@mui/material'

const YoutubePractice = () => {
  return (
    <Box>
      <TextField
        sx={{ minWidth: 380 }}
        id="standard-basic"
        label="Youtube link"
        variant="standard"
      />
    </Box>
  )
}

export default YoutubePractice
