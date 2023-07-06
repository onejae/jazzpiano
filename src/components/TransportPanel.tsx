import { Box, Button } from '@mui/material'
import { useTransport } from '@providers/TransportProvider'
import { useCallback } from 'react'

export const TransportPanel = () => {
  const { playingState, setPlayingState } = useTransport()
  const handlePlayButton = useCallback(() => {
    setPlayingState((current) => (current === 'playing' ? 'paused' : 'playing'))
  }, [setPlayingState])

  const handleStopButton = useCallback(() => {
    setPlayingState('stopped')
  }, [setPlayingState])

  return (
    <Box sx={{ backgroundColor: 'white' }}>
      <Button onClick={handlePlayButton}>
        {playingState === 'playing' ? 'Pause' : 'Play'}
      </Button>
      <Button onClick={handleStopButton}>Stop</Button>
      <Button>{'<<'}</Button>
      <Button>{'<'}</Button>
      <Button>{'>'}</Button>
      <Button>{'>>'}</Button>
    </Box>
  )
}
