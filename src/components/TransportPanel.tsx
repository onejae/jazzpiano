import {
  Box,
  Button,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
} from '@mui/material'
import { PlayingMode, useTransport } from '@providers/TransportProvider'
import { useCallback } from 'react'

export const TransportPanel = () => {
  const { playingState, setPlayingState, setPlayingMode, setRailAngle } =
    useTransport()
  const handlePlayButton = useCallback(() => {
    setPlayingState((current) => (current === 'playing' ? 'paused' : 'playing'))
  }, [setPlayingState])

  const handleStopButton = useCallback(() => {
    setPlayingState('stopped')
  }, [setPlayingState])

  const handleModeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPlayingMode(event.target.value as PlayingMode)
    },
    [setPlayingMode]
  )

  return (
    <Box sx={{ backgroundColor: 'white', display: 'flex' }}>
      <Box flexGrow={1}>
        <Button onClick={handlePlayButton}>
          {playingState === 'playing' ? 'Pause' : 'Play'}
        </Button>
        <Button onClick={handleStopButton}>Stop</Button>
        <Button>{'<<'}</Button>
        <Button>{'<'}</Button>
        <Button>{'>'}</Button>
        <Button>{'>>'}</Button>
      </Box>
      <Box flexGrow={1}>
        <Button onClick={() => setRailAngle((c) => (c -= 0.1))}>Up</Button>
        <Button onClick={() => setRailAngle((c) => (c += 0.1))}>Down</Button>
      </Box>
      <Box>
        <FormGroup>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="preview"
            name="radio-buttons-group"
            onChange={handleModeChange}
            row
          >
            <FormControlLabel
              value="preview"
              control={<Radio />}
              label="Preview"
            />
            <FormControlLabel
              value="standard"
              control={<Radio />}
              label="Standard"
            />
            <FormControlLabel value="step" control={<Radio />} label="Step" />
          </RadioGroup>
        </FormGroup>
      </Box>
    </Box>
  )
}
