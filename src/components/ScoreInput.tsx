import { Box, Button, TextField } from '@mui/material'
import axios from 'axios'
import { useCallback } from 'react'

const ScoreInput = ({ open }) => {
  const SubmitScore = useCallback(() => {
    axios
      .post('/put_score/', { name: 'tiofjaiow', score: 213128 })
      .then((e) => console.log(e))
  }, [])

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
      <Button onClick={SubmitScore}>Submit</Button>
    </Box>
  )
}

export default ScoreInput
