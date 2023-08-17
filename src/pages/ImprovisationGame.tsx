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
import { KeyModel } from '@libs/midiControl'
import { Box, Button } from '@mui/material'
import {
  BlockInfo,
  CandidateInfo,
  generateNormalScaleBlock,
  generateScaleBlockWithEntryNote,
  useGame,
} from '@providers/GameControlProvider'

import { Mesh, MeshToonMaterial } from 'three'

import { TextGeometry as TextGeometryPure } from 'three/addons/geometries/TextGeometry.js'
import { Font, FontLoader } from 'three/addons/loaders/FontLoader.js'
import { MovingStars } from '@components/InfiniteBackround'
import { BlockGenerator, gameState } from '@providers/GameState'
import ParticleExplosion from '@components/ParicleExplosion'
import LeaderBoard from '@components/LeaderBoard'
import { ComboBox } from '@components/ComboBox'
import { getKeyNamesFromKeyScale } from '@libs/midiControl'

const Y_LENGTH_PER_SECOND = 5

const loader = new FontLoader()

const touchLinePosition = new THREE.Vector3(0, -3, 0)

let blockFont: Font = null

gameState.blockGenerators.push(
  generateNormalScaleBlock,
  generateScaleBlockWithEntryNote
)

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
  const { playState, setPlayState, setShowLeaderBoard } = useGame()

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
    gameState.score = 0
    gameState.hp = 10
    setPlayState('PLAYING')
  }, [setPlayState])

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
      {playState != 'PLAYING' && (
        <Box display="flex" flexDirection={'column'}>
          <Button
            onClick={handlePlayButton}
            sx={{ fontSize: 50, color: 'white' }}
          >
            START
          </Button>
          <Button
            sx={{ color: 'white' }}
            onClick={() => setShowLeaderBoard(true)}
          >
            view ranking
          </Button>
        </Box>
      )}
    </Box>
  )
}

const ScorePanel = () => {
  const [scoreToRender, setScore] = useState(gameState.score)

  useFrame(() => {
    if (scoreToRender !== gameState.score) {
      setScore(gameState.score)
    }
  })

  return (
    <mesh position={[0, 2, 0]}>
      <RText
        letterSpacing={0.2}
        outlineWidth={0.1}
        outlineColor={'white'}
        strokeWidth={0.2}
        strokeColor={'black'}
        scale={[1, 1, 1]}
        color={'white'}
        position={[0, 4.5, 0]}
        anchorX="center"
        anchorY="middle"
      >
        {scoreToRender}
      </RText>
    </mesh>
  )
}

const BAR_WIDTH = 7

const GaugeBar = (props: ThreeElements['group']) => {
  const lastScoreRef = useRef(gameState.score)
  const redBarRef = useRef<THREE.Mesh>()
  const [redBarScale, setRedBarScale] = useState(1)
  const [yellowBarScale, setYellowBarScale] = useState(1)
  const BAR_MOVEMENT_TIME = 0.5
  const renderTimer = useRef(0)

  useFrame((_state, delta) => {
    if (lastScoreRef.current != gameState.hp) {
      lastScoreRef.current = gameState.hp
      renderTimer.current = 0
      setYellowBarScale(gameState.hp / 100)
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
  const { setHandleCandidateChange, compositionNotes } = useGame()

  const handleCandidateChange = useCallback((candidates: CandidateInfo[]) => {
    setCandidateStrings([...candidates])
  }, [])

  useEffect(() => {
    setHandleCandidateChange(handleCandidateChange)
  }, [handleCandidateChange, setHandleCandidateChange])

  return (
    <mesh position={[-9, 0.5, 0]}>
      {compositionNotes.current.map((note, idx) => {
        return (
          <RText
            key={idx}
            scale={0.2}
            color={'black'}
            position={[-1 + 0.2 * idx, 1.5, 0]}
            anchorX="center"
            anchorY="middle"
          >
            {note}
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

const blockMeshs: { [key: string]: THREE.Mesh } = {}

const GamePlayBoard = () => {
  const {
    playState,
    setPlayState,
    blocks,
    timer,
    lastBlockDropTime,
    setHandleCandidateHit,
    setShowLeaderBoard,
  } = useGame()
  const refBoard = useRef<THREE.Group>(null!)
  const { railAngle } = useTransport()
  const [explosions, setExplosions] = useState([])
  const refLastHitTime = useRef(0)

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
        ids.forEach((id) => {
          gameState.combo += 1
          refLastHitTime.current = timer.current

          setExplosions((prevExplosions) => {
            blockMeshs[id].geometry.computeBoundingBox()

            const center = blockMeshs[id].geometry.boundingBox.getCenter(
              new THREE.Vector3()
            )
            return [
              ...prevExplosions,
              {
                position: [
                  blockMeshs[id].position.x + center.x,
                  blockMeshs[id].position.y -
                    Y_LENGTH_PER_SECOND * timer.current,
                  blockMeshs[id].position.z,
                ],
              },
            ]
          })
          refBoard.current.remove(blockMeshs[id])
        })

        blocks.current = remains
        gameState.score += gameState.combo * 5
      })
    },
    [blocks, timer]
  )

  useEffect(() => {
    setHandleCandidateHit(handleCandidateHit)
  }, [handleCandidateHit, setHandleCandidateHit])

  // level design
  const generateBlock = useCallback((time: number): BlockInfo => {
    let generator: BlockGenerator = null

    if (time < 30) {
      generator = gameState.blockGenerators[1]
    } else {
      generator = gameState.blockGenerators[1]
    }

    return generator(time)
  }, [])

  const generateMeshFromBlockInfo = useCallback(
    (blockInfo: BlockInfo) => {
      const materials = [
        new MeshToonMaterial({ color: 0xff0000 }), // front
        new MeshToonMaterial({ color: 0xffff00 }), // side
      ]

      const geo = new TextGeometryPure(
        `${blockInfo.key} ${blockInfo.scaleType}`,
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

      textMesh.position.x = blockInfo.positionX
      textMesh.position.y =
        touchLinePosition.y + blockInfo.endAt * Y_LENGTH_PER_SECOND
      textMesh.position.z = 0

      if (blockInfo.type === 'SCALE_WITH_ENTRYNOTE') {
        const materials = [
          new MeshToonMaterial({ color: 0xff0000 }), // front
          new MeshToonMaterial({ color: 0xff0000 }), // side
        ]
        const startKeyName = getKeyNamesFromKeyScale(
          blockInfo.key,
          blockInfo.scaleType
        )[blockInfo.startNoteIndex]

        const geo = new TextGeometryPure(`from ${startKeyName}`, {
          size: 0.7,
          height: 0.2,
          curveSegments: 2,
          font: blockFont,
        })
        const noteMesh = new Mesh(geo, materials)
        noteMesh.position.set(0, -1, 0)
        textMesh.add(noteMesh)
      }

      textMesh.rotateX(-railAngle)

      return textMesh
    },
    [railAngle]
  )

  const speed = 1

  const processGameOver = () => {
    Object.keys(blockMeshs).forEach((key) => {
      refBoard.current.remove(blockMeshs[key])
    })
    setPlayState('GAMEOVER')
    setShowLeaderBoard(true)
  }

  useFrame((_state, delta) => {
    if (playState === 'PLAYING') {
      // check blocks touche line
      const touches = blocks.current.filter((v) => v.endAt <= timer.current)
      const remains = blocks.current.filter((v) => v.endAt > timer.current)

      gameState.hp -= touches.length * 5

      touches.forEach((blockInfo) => {
        const blockMesh = blockMeshs[blockInfo.id]

        refBoard.current.remove(blockMesh)
        gameState.combo = 0
        setExplosions((prevExplosions) => {
          blockMesh.geometry.computeBoundingBox()
          const center = blockMesh.geometry.boundingBox.getCenter(
            new THREE.Vector3()
          )

          return [
            ...prevExplosions,
            {
              position: [
                blockMesh.position.x + center.x,
                blockMesh.position.y - Y_LENGTH_PER_SECOND * timer.current,
                blockMesh.position.z,
              ],
              color: 'red',
            },
          ]
        })
      })

      blocks.current = remains

      delta *= speed
      timer.current += delta

      if (
        lastBlockDropTime.current === 0 ||
        timer.current - lastBlockDropTime.current >= 3
      ) {
        const newBlock = generateBlock(timer.current)

        if (newBlock) {
          blocks.current.push(newBlock)

          const blockMesh = generateMeshFromBlockInfo(newBlock)
          blockMeshs[newBlock.id] = blockMesh
          refBoard.current.add(blockMesh)

          lastBlockDropTime.current = timer.current
        }
      }

      if (gameState.hp <= 0) {
        processGameOver()
      }

      refBoard.current.position.setY(-Y_LENGTH_PER_SECOND * timer.current)
    }
  })

  return (
    <group>
      <group ref={refBoard}></group>
      {explosions.map((explosion, index) => {
        return (
          <ParticleExplosion
            key={index}
            position={explosion.position}
            color={explosion.color}
            // onExplosionFinished={() => removeExplosion(index)}
          />
        )
      })}
    </group>
  )
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
  const { judgeWithNewNote, showLeaderBoard, setShowLeaderBoard, timer } =
    useGame()

  useEffect(() => {
    setHandleMidiNoteDown((midiNumber: number) => {
      judgeWithNewNote(KeyModel.getNoteNameFromMidiNumber(midiNumber))
    })
  }, [judgeWithNewNote, setHandleMidiNoteDown])

  return (
    <Box display="flex" flexDirection={'column'} minHeight="100%">
      <Box flexGrow={1} minHeight="100%">
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
                height: 'calc(100vh - 100px)',
                backgroundColor: 'white',
              }}
            >
              <Canvas
                onCreated={({ gl }) => {
                  gl.localClippingEnabled = true
                }}
                camera={{
                  position: [0, 0, 15],
                  fov: 55,
                  near: 0.1,
                  far: 400,
                }}
              >
                <ambientLight position={[-3, 0, -3]} intensity={0.9} />
                <pointLight position={[-13, 10, 0]} intensity={0.9} />
                <GaugeBar position={[-11, 6.5, 0]} />
                <TransportGroup>
                  <Background />
                  <GamePlayBoard />
                  <VirtualPiano position={touchLinePosition} />
                </TransportGroup>
                <CandidateComposition />
                <ScorePanel />
                <ComboBox position={[-16, 2, 0]} />
              </Canvas>
            </div>
          </div>
          <GameButtons />
          <LeaderBoard
            open={showLeaderBoard}
            onClose={() => setShowLeaderBoard(false)}
          />
        </TransportProvider>
      </Box>
    </Box>
  )
}

export default ImprovisationGame
