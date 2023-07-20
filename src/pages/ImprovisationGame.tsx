import { useMidiControl } from '@providers/MidiControl'
import { TransportProvider, useTransport } from '@providers/TransportProvider'

import { TransportGroup } from '@components/TransportGroup'
import { VirtualPiano } from '@components/VirtualPiano'
import { Text as RText } from '@react-three/drei'
import { Canvas, ThreeElements, extend, useFrame } from '@react-three/fiber'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
extend({ TextGeometry })

import * as THREE from 'three'
import { KeyName } from '@constants/notes'
import { ScaleIndexTable, ScaleName } from '@constants/scales'
import { KeyModel } from '@libs/midiControl'
import {
  generateUniqueId,
  getRandomElement,
  getRandomFloat,
} from '@libs/number'
import { Box, Button } from '@mui/material'
import {
  BlockInfo,
  CandidateInfo,
  useGame,
} from '@providers/GameControlProvider'

import { Mesh, MeshToonMaterial } from 'three'

import { TextGeometry as TextGeometryPure } from 'three/addons/geometries/TextGeometry.js'
import { Font, FontLoader } from 'three/addons/loaders/FontLoader.js'
import { MovingStars } from '@components/InfiniteBackround'

const Y_LENGTH_PER_SECOND = 5

const loader = new FontLoader()

let blockFont: Font = null

loader.load(
  // resource URL
  'fonts/helvetiker_bold.typeface.json',

  // onLoad callback
  function (font) {
    blockFont = font
  },

  // onProgress callback
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },

  // onError callback
  function (err) {
    console.log('An error happened')
  }
)

const GameButtons = () => {
  const { gameState, setGameState } = useGame()

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
    <Box
      sx={{
        backgroundColor: 'white',
        display: 'flex',
        position: 'fixed',
        background: 'transparent',
        left: '25%',
        right: '25%',
        top: '50vh',
        justifyContent: 'center',
      }}
    >
      {gameState != 'PLAYING' && (
        <Box>
          <Button onClick={handlePlayButton} sx={{ fontSize: 50 }}>
            START
          </Button>
        </Box>
      )}
    </Box>
  )
}

const keyNames: KeyName[] = [
  'C',
  'C#',
  'Db',
  'D',
  'D#',
  'Eb',
  'E',
  'F',
  'F#',
  'Gb',
  'G',
  'G#',
  'Ab',
  'A',
  'A#',
  'Bb',
]

const scaleNames = Object.keys(ScaleIndexTable)

const ScoreBoard = () => {
  const { refScore } = useGame()
  const [score, setScore] = useState(refScore.current)

  useFrame(() => {
    if (score !== refScore.current) {
      setScore(refScore.current)
    }
  })

  return (
    <mesh>
      <RText
        scale={[1, 1, 1]}
        color={'black'}
        position={[-12, 4.5, 0]}
        anchorX="center"
        anchorY="middle"
      >
        {score}
      </RText>
    </mesh>
  )
}

const BAR_WIDTH = 7

const GaugeBar = (props: ThreeElements['group']) => {
  const { refScore } = useGame()
  const lastScoreRef = useRef(refScore.current)
  const redBarRef = useRef<THREE.Mesh>()
  const [redBarScale, setRedBarScale] = useState(1)
  const [yellowBarScale, setYellowBarScale] = useState(1)
  const BAR_MOVEMENT_TIME = 0.5
  const renderTimer = useRef(0)

  useFrame((_state, delta) => {
    if (lastScoreRef.current != refScore.current) {
      lastScoreRef.current = refScore.current
      renderTimer.current = 0
      setYellowBarScale(refScore.current / 100)
    }

    if (redBarScale != yellowBarScale) {
      const gap =
        (redBarScale - yellowBarScale) *
        (1 - renderTimer.current / BAR_MOVEMENT_TIME)

      if (renderTimer.current >= BAR_MOVEMENT_TIME) {
        setRedBarScale(yellowBarScale)
      } else {
        setRedBarScale(yellowBarScale + gap)
      }
    }

    renderTimer.current += delta
  })

  return (
    <group {...props}>
      <RText scale={0.5} position={[-4, -0.05, 0]} color={'white'}>
        HP
      </RText>

      <mesh>
        <planeGeometry args={[BAR_WIDTH, 0.3]} />
        <meshBasicMaterial color={0x0000ff} transparent />
      </mesh>
      <mesh
        ref={redBarRef}
        position={[(BAR_WIDTH - BAR_WIDTH * redBarScale) * -0.5, 0, 0]}
      >
        <planeGeometry args={[BAR_WIDTH * redBarScale, 0.3]} />
        <meshBasicMaterial color={0xff00000} transparent />
      </mesh>
      <mesh
        ref={redBarRef}
        position={[(BAR_WIDTH - BAR_WIDTH * yellowBarScale) * -0.5, 0, 0]}
      >
        <planeGeometry args={[BAR_WIDTH * yellowBarScale, 0.3]} />
        <meshBasicMaterial color={0xffff000} transparent />
      </mesh>
    </group>
  )
}
const CandidateComposition = () => {
  const [candidateStrings, setCandidateStrings] = useState([])
  const { setHandleCandidateChange, compositionKeys } = useGame()

  const handleCandidateChange = useCallback((candidates: CandidateInfo[]) => {
    setCandidateStrings([...candidates])
  }, [])

  useEffect(() => {
    setHandleCandidateChange(handleCandidateChange)
  }, [handleCandidateChange, setHandleCandidateChange])

  return (
    <mesh position={[-9, 0.5, 0]}>
      {compositionKeys.current.map((key, idx) => {
        return (
          <RText
            key={idx}
            scale={0.2}
            color={'black'}
            position={[-1 + 0.2 * idx, 1.5, 0]}
            anchorX="center"
            anchorY="middle"
          >
            {key}
          </RText>
        )
      })}
      {candidateStrings.map((candidate, idx) => {
        const candidateString = `${candidate.key} ${candidate.scale} ${candidate.score}`
        const scale = 0.3
        return (
          <RText
            key={idx}
            scale={scale}
            color={'black'}
            position={[0, -0.5 * idx, 0]}
            anchorX="center"
            anchorY="middle"
          >
            {candidateString}
          </RText>
        )
      })}
    </mesh>
  )
}

const GamePlayBoard = () => {
  const {
    gameState,
    blocks,
    timer,
    lastBlockDropTime,
    refScore,
    setHandleCandidateHit,
  } = useGame()
  const refBoard = useRef<THREE.Group>(null!)
  const { railAngle } = useTransport()
  const refBlockMeshes = useRef<{ [key: string]: THREE.Mesh }>({})
  const handleCandidateHit = useCallback(
    (hits: CandidateInfo[]) => {
      hits.forEach((hit) => {
        const remains = blocks.current.filter(
          (v) => v.key !== hit.key || v.scaleType !== hit.scale
        )
        const ids = blocks.current.reduce((acc, curr) => {
          if (curr.key === hit.key && curr.scaleType === hit.scale) {
            acc.push(curr.id)
          }
          return acc
        }, [])
        ids.forEach((id) => refBoard.current.remove(refBlockMeshes.current[id]))
        blocks.current = remains
      })
    },
    [blocks]
  )

  useEffect(() => {
    setHandleCandidateHit(handleCandidateHit)
  }, [handleCandidateHit, setHandleCandidateHit])

  const generateNewBlock = useCallback(
    (time: number): BlockInfo => {
      if (
        lastBlockDropTime.current === 0 ||
        time - lastBlockDropTime.current >= 5
      ) {
        const newBlock: BlockInfo = {
          id: generateUniqueId(),
          key: getRandomElement(keyNames),
          scaleType: getRandomElement(scaleNames) as ScaleName,
          startNoteIndex: 0,
          endAt: 20 + time,
          positionX: getRandomFloat(-10, 10),
          noteNumToHit: 8,
        }

        lastBlockDropTime.current = time

        return newBlock
      } else {
        return null
      }
    },
    [lastBlockDropTime]
  )

  const speed = 1

  useFrame((_state, delta) => {
    if (gameState === 'PLAYING') {
      // check blocks touche line
      const touches = blocks.current.filter((v) => v.endAt <= timer.current)
      const remains = blocks.current.filter((v) => v.endAt > timer.current)

      refScore.current -= touches.length * 5

      touches.forEach((blockInfo) => {
        const blockMesh = refBlockMeshes.current[blockInfo.id]

        refBoard.current.remove(blockMesh)
      })

      blocks.current = remains

      delta *= speed
      timer.current += delta

      // add new block
      const newBlock = generateNewBlock(timer.current)

      if (newBlock) {
        blocks.current.push(newBlock)

        const materials = [
          new MeshToonMaterial({ color: 0xff0000 }), // front
          new MeshToonMaterial({ color: 0xffff00 }), // side
        ]

        const geo = new TextGeometryPure(
          `${newBlock.key} ${newBlock.scaleType}`,
          {
            size: 1,
            height: 0.2,
            curveSegments: 2,
            font: blockFont,
            bevelEnabled: true,
            bevelSize: 0.2,
            bevelThickness: 0.1,
          }
        )
        const textMesh = new Mesh(geo, materials)

        textMesh.position.x = newBlock.positionX
        textMesh.position.y = newBlock.endAt * Y_LENGTH_PER_SECOND
        textMesh.position.z = 0
        textMesh.rotateX(-railAngle)

        refBlockMeshes.current[newBlock.id] = textMesh
        refBoard.current.add(textMesh)
      }

      refBoard.current.position.setY(-Y_LENGTH_PER_SECOND * timer.current)
    }
  })
  return <group ref={refBoard}></group>
}

const Background = () => {
  const timeRef = useRef(0)

  useFrame(({ clock }) => {
    timeRef.current = clock.getElapsedTime()
  })
  return (
    <mesh>
      <MovingStars />
    </mesh>
  )
}

const ImprovisationGame = () => {
  const { setHandleMidiNoteDown } = useMidiControl()
  const { judgeWithNewKey } = useGame()

  useEffect(() => {
    setHandleMidiNoteDown((midiNumber: number) => {
      judgeWithNewKey(KeyModel.getNoteFromMidiNumber(midiNumber, false))
    })
  }, [judgeWithNewKey, setHandleMidiNoteDown])

  return (
    <Box display="flex" flexDirection={'column'}>
      <Box flexGrow={1}>
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
                  far: 400,
                }}
              >
                <ambientLight position={[-3, 0, -3]} intensity={0.9} />
                <pointLight position={[-13, 10, 0]} intensity={0.9} />
                <GaugeBar position={[-11, 5, 0]} />
                <TransportGroup>
                  <Background />
                  <GamePlayBoard />
                  <VirtualPiano />
                </TransportGroup>
                <CandidateComposition />
              </Canvas>
            </div>
          </div>
          <GameButtons />
        </TransportProvider>
      </Box>
    </Box>
  )
}

export default ImprovisationGame
