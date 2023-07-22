import { useState } from 'react'
import { Box, Button, Tabs, Tab, Typography } from '@mui/material'

const LeaderBoard = ({ open, users, onClose }) => {
  const [currentTab, setCurrentTab] = useState(0)

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
          Close
        </Button>
      </Box>
      <Tabs value={currentTab} onChange={handleTabChange}>
        <Tab label="Scale" />
        <Tab label="Chord" />
        <Tab label="Mixed" />
      </Tabs>
      <Box sx={{ p: 3 }}>
        {users.map((user, index) => (
          <Box display="flex">
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