import { useState } from 'react'
import { Box, Button, Tabs, Tab, Typography } from '@mui/material'
import { useScore } from '@providers/GameScoreProvider'

const LeaderBoard = ({ open, ranks, onClose }) => {
  const [currentTab, setCurrentTab] = useState(0)

  // const { ranks } = useScore()

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue)
  }
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
      }}
    >
      <Box display={'flex'}>
        <Typography p={1}></Typography>
        <Button color="inherit" onClick={onClose} sx={{ marginLeft: 'auto' }}>
          X
        </Button>
      </Box>
      <Box paddingLeft={3}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Scale" />
          <Tab label="Chord" disabled />
          <Tab label="Mixed" disabled />
        </Tabs>
      </Box>
      <Box sx={{ p: 3 }}>
        {ranks.map((user, index) => (
          <Box key={index} display="flex">
            <Typography flexGrow={1} key={index} variant="body1">
              {user.name}
            </Typography>
            <Typography> {user.score}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default LeaderBoard
