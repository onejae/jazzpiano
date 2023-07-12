import { RealPiano } from '@components/RealPiano'
import { Box, Button } from '@mui/material'
import { MidiControlProvider } from '@providers/MidiControl'
import { TransportProvider } from '@providers/TransportProvider'

import { TransportGroup } from '@components/TransportGroup'
import { VirtualPiano } from '@components/VirtualPiano'
import { Canvas, useFrame } from '@react-three/fiber'
import { useCallback, useState } from 'react'
import { GameControlProvider, useGame } from '@providers/GameControlProvider'

const GameControl = () => {
  const { gameState, setGameState, refBlocks } = useGame()

  const needToDropNew = useCallback(() => {
    return false
  }, [])

  useFrame((_state, delta) => {
    if (needToDropNew()) {
    }
  })
  return <></>
}

const

const ImprovisationGame = () => {
  return (
    <Box display="flex" flexDirection={'column'}>
      <Box flexGrow={1}>
        <GameControlProvider>
          <TransportProvider>
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
                      <RealPiano />
                      <VirtualPiano />
                    </TransportGroup>
                  </MidiControlProvider>
                  <GameControl />
                </Canvas>
              </div>
            </div>
          </TransportProvider>
        </GameControlProvider>
      </Box>
    </Box>
  )
}

export default ImprovisationGame
