import { RealPiano } from '@components/RealPiano'
import { Box, Button } from '@mui/material'
import { MidiControlProvider } from '@providers/MidiControl'
import { TransportProvider, useTransport } from '@providers/TransportProvider'

import { TransportGroup } from '@components/TransportGroup'
import { VirtualPiano } from '@components/VirtualPiano'
import { Canvas, useFrame } from '@react-three/fiber'
import { useCallback, useEffect, useRef } from 'react'
import { Text } from '@react-three/drei'

import {
  GameControlProvider,
  useGame,
  BlockInfo,
} from '@providers/GameControlProvider'

const Y_LENGTH_PER_SECOND = 1

const GameButtons = () => {
  const { setGameState } = useGame()

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
  const { gameState, blocks, setBlocks, timer, lastBlockDropTime } = useGame()
  const refBoard = useRef<THREE.Group>(null!)
  const { railAngle } = useTransport()

  // for test
  useEffect(() => {
    setBlocks([{ key: 'C', scaleType: 'major', startFrom: 0, endAt: 10 + 5 }])
  }, [setBlocks])

  const generateNewBlock = useCallback(
    (time: number): BlockInfo => {
      if (time - lastBlockDropTime.current >= 3) {
        const newBlock: BlockInfo = {
          key: 'C',
          scaleType: 'major',
          startFrom: 0,
          endAt: 10 + time,
        }

        lastBlockDropTime.current = time

        return newBlock
      } else {
        return null
      }
    },
    [lastBlockDropTime]
  )

  useFrame((_state, delta) => {
    if (gameState === 'PLAYING') {
      const newBlock = generateNewBlock(timer.current)

      if (newBlock) {
        const newBlocks = [...blocks]

        newBlocks.push(newBlock)

        setBlocks(newBlocks)
      }

      timer.current += delta

      refBoard.current.position.setY(-Y_LENGTH_PER_SECOND * timer.current)
    }
  })
  return (
    <group ref={refBoard}>
      {blocks.map((v: BlockInfo) => (
        <mesh>
          <Text
            scale={[1, 1, 1]}
            color={'black'}
            position={[0, v.endAt * Y_LENGTH_PER_SECOND, 0]}
            // rotation={[-railAngle, 0, 0]}
            anchorX="center"
            anchorY="middle"
          >
            {v.key} {v.scaleType}
          </Text>
        </mesh>
      ))}
    </group>
  )
}

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
                      <GamePlayBoard />
                      <RealPiano />
                      <VirtualPiano />
                    </TransportGroup>
                  </MidiControlProvider>
                </Canvas>
              </div>
            </div>
            <GameButtons />
          </TransportProvider>
        </GameControlProvider>
      </Box>
    </Box>
  )
}

export default ImprovisationGame
