import { Box, Button, TextField } from '@mui/material'

const ScoreInput = ({ open }) => {
  open = true
  if (!open) return <></>
  return (
    <Box
      sx={{
        top: '25%',
        left: 'calc(50vw - 200px)',
        width: 400,
        position: 'absolute',
        bgcolor: 'white',
        borderRadius: 2,
        padding: 2,
      }}
    >
      <TextField id="standard-basic" label="Name" variant="standard" />
      <Button>Submit</Button>
    </Box>
  )
}

export default ScoreInput
