import { useMidiControl } from '@providers/MidiControl'
import { TransportProvider, useTransport } from '@providers/TransportProvider'

import { TransportGroup } from '@components/TransportGroup'
import { VirtualPiano } from '@components/VirtualPiano'
import { Canvas, useFrame } from '@react-three/fiber'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Text as RText } from '@react-three/drei'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { extend } from '@react-three/fiber'
extend({ TextGeometry })

import { useGame, BlockInfo } from '@providers/GameControlProvider'
import { KeyName } from '@constants/notes'
import {
  generateUniqueId,
  getRandomElement,
  getRandomFloat,
} from '@libs/number'
import { ScaleName } from '@constants/scales'
import { KeyModel } from '@libs/midiControl'
import { Box, Button } from '@mui/material'

import { Mesh, MeshToonMaterial } from 'three'

import { TextGeometry as TextGeometryPure } from 'three/addons/geometries/TextGeometry.js'
import { Font, FontLoader } from 'three/addons/loaders/FontLoader.js'

const Y_LENGTH_PER_SECOND = 1

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

const scaleNames: ScaleName[] = [
  'major',
  'minor',
  'ionian',
  'dorian',
  'phrygian',
  'lydian',
  'mixolydian',
  'aeolian',
  'locrian',
]

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

const CandidateComposition = () => {
  const [candidateGeometry, setCandidateGeometry] = useState()
  const { setHandleCandidateChange } = useGame()

  useEffect(() => {
    setHandleCandidateChange((candidates) => {
      console.log('----------- new candidates', candidates)
    })
  }, [setHandleCandidateChange])

  useFrame(() => {
    // const newGeometry = (
    //   <textGeometry args={['test', { font: blockFont, size: 1, height: 1 }]} />
    // )
  })

  return <mesh>{candidateGeometry}</mesh>

  //  if (newBlock) {
  //         blocks.current.push(newBlock)

  //         const materials = [
  //           new MeshToonMaterial({ color: 0xff0000 }), // front
  //           new MeshToonMaterial({ color: 0xffff00 }), // side
  //         ]

  //         const geo = new TextGeometry(`${newBlock.key} ${newBlock.scaleType}`, {
  //           size: 1,
  //           height: 0.2,
  //           curveSegments: 2,
  //           font: blockFont,
  //         })
  //         const textMesh = new Mesh(geo, materials)

  //         textMesh.position.x = newBlock.positionX
  //         textMesh.position.y = newBlock.endAt * Y_LENGTH_PER_SECOND
  //         textMesh.position.z = 0
  //         textMesh.rotateX(-railAngle)

  //         refBlockMeshes.current[newBlock.id] = textMesh
  //         refBoard.current.add(textMesh)
  //   return <mesh>

  //   </mesh>
}

const GamePlayBoard = () => {
  const { gameState, blocks, timer, lastBlockDropTime, refScore } = useGame()
  const refBoard = useRef<THREE.Group>(null!)
  const { railAngle } = useTransport()
  const refBlockMeshes = useRef<{ [key: string]: THREE.Mesh }>({})

  const generateNewBlock = useCallback(
    (time: number): BlockInfo => {
      if (time - lastBlockDropTime.current >= 5) {
        const newBlock: BlockInfo = {
          id: generateUniqueId(),
          key: getRandomElement(keyNames),
          scaleType: getRandomElement(scaleNames),
          startNoteIndex: 0,
          endAt: 20 + time,
          positionX: getRandomFloat(-10, 10),
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

const ImprovisationGame = () => {
  const { setHandleMidiNoteDown } = useMidiControl()
  const { judgeWithNewKey } = useGame()

  useEffect(() => {
    setHandleMidiNoteDown((midiNumber: number) => {
      console.log('here')
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
                  far: 200,
                }}
              >
                <ambientLight position={[0, 0, 0]} intensity={0.3} />
                <pointLight position={[-3, 3, 0]} intensity={1.3} />
                <ScoreBoard />
                <TransportGroup>
                  <GamePlayBoard />
                  <CandidateComposition />
                  <VirtualPiano />
                </TransportGroup>
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
