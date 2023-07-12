import { RealPiano } from '@components/RealPiano'
import { Box, Button } from '@mui/material'
import { MidiControlProvider } from '@providers/MidiControl'
import { TransportProvider, useTransport } from '@providers/TransportProvider'

import { TransportGroup } from '@components/TransportGroup'
import { VirtualPiano } from '@components/VirtualPiano'
import { Canvas, useFrame } from '@react-three/fiber'
import { useCallback, useRef, useState } from 'react'
import {
  GameControlProvider,
  useGame,
  BlockInfo,
} from '@providers/GameControlProvider'

const GameControl = () => {
  const { gameState, setGameState, refBlocks, timer, lastBlockDropTime } =
    useGame()

  const generateNewBlock = useCallback(
    (timer: number): BlockInfo => {
      if (timer - lastBlockDropTime.current >= 3) {
        const newBlock: BlockInfo = {
          key: 'C',
          scaleType: 'major',
          startFrom: 0,
        }

        lastBlockDropTime.current = timer

        return newBlock
      } else {
        return null
      }
    },
    [lastBlockDropTime]
  )

  useFrame((_state, delta) => {
    if (gameState === 'PLAYING') {
      if (generateNewBlock(timer.current)) {
        console.log('ok')
      }

      timer.current += delta
    }
  })
  return <></>
}

const GameButtons = () => {
  const { gameState, setGameState, refBlocks } = useGame()

  const { railAngle, setRailAngle } = useTransport()

  const handleAngleIncrease = useCallback(() => {
    const newAngle = railAngle + 0.1
    setRailAngle(newAngle)
  }, [railAngle, setRailAngle])

  const handleAngleDecrease = useCallback(() => {
    const newAngle = railAngle - 0.1
    setRailAngle(newAngle)
  }, [railAngle, setRailAngle])

  const handlePlayButton = useCallback(() => {
    setGameState('PLAYING')
  }, [setGameState])

  return (
    <Box sx={{ backgroundColor: 'white', display: 'flex' }}>
      <Box flexGrow={1}>
        <Button onClick={handlePlayButton}>START</Button>
      </Box>
      <Box flexGrow={1}>
        <Button onClick={handleAngleDecrease}>Up</Button>
        <Button onClick={handleAngleIncrease}>Down</Button>
      </Box>
    </Box>
  )
}

const GamePlayBoard = () => {
  const { refBlocks } = useGame()
  return (
    <div
      style={{
        width: '100%',
        justifyContent: 'center',
        display: 'flex',
      }}
    >
      <div
        style={{
          width: '100vw',
          height: 'calc(60vh)',
          backgroundColor: 'white',
        }}
      >
        <Canvas
          onCreated={({ gl }) => {
            gl.localClippingEnabled = true
          }}
          camera={{
            position: [0, 0, 13],
            fov: 45,
            near: 0.1,
            far: 200,
          }}
        >
          <ambientLight position={[2, 0, 0]} intensity={0.3} />
          <pointLight position={[-3, 0, 0]} intensity={3.3} />
          <MidiControlProvider>
            <TransportGroup>
              {refBlocks.current.map((v: BLockInfo) => {
                return <mesh></mesh>
              })}
              <RealPiano />
              <VirtualPiano />
            </TransportGroup>
          </MidiControlProvider>
          <GameControl />
        </Canvas>
      </div>
    </div>
  )
}

const ImprovisationGame = () => {
  return (
    <Box display="flex" flexDirection={'column'}>
      <Box flexGrow={1}>
        <GameControlProvider>
          <TransportProvider>
            <GamePlayBoard />
            <GameButtons />
          </TransportProvider>
        </GameControlProvider>
      </Box>
    </Box>
  )
}

export default ImprovisationGame
