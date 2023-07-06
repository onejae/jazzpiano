import * as THREE from 'three'
import { NoteEvent } from 'types/midi'

import { Canvas, useFrame } from '@react-three/fiber'

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  KeyRenderSpace,
  VirtualPiano,
  useVirtualPiano,
} from '@components/VirtualPiano'
import { useMidiControl } from '../providers/MidiControl'
import { TransportPanel } from './TransportPanel'
import { useTransport } from '@providers/TransportProvider'

interface PianoRollProps {
  noteEvents: NoteEvent[]
}

const Y_LENGTH_PER_SECOND = 1
interface RenderInfo {
  timer: number
  indexFrom: number
  blockRail: { [key: string]: { noteEvent: NoteEvent; idx: number }[] }
  status: 'INIT' | 'LOADED' | 'PLAYING'
}

const PianoRoll = (props: PianoRollProps) => {
  const { noteUp, noteDown } = useVirtualPiano()
  const ref = useRef<THREE.Group>(null!)
  const refNoteBlocks = Array.from({ length: 10000 }, () =>
    useRef<THREE.MeshStandardMaterial>(null!)
  )
  const { setHandleNoteDown } = useMidiControl()
  const { playingState, playingMode } = useTransport()

  const renderInfo = useRef<RenderInfo>({
    timer: 0,
    indexFrom: 0,
    blockRail: {},
    status: 'INIT',
  })

  useEffect(() => {
    setHandleNoteDown(() => (midiNumber: number) => {
      if (
        !(midiNumber in renderInfo.current.blockRail) ||
        renderInfo.current.blockRail[midiNumber].length === 0
      )
        return
      const block = renderInfo.current.blockRail[midiNumber][0]

      if (block.noteEvent[0] <= renderInfo.current.timer) {
        renderInfo.current.blockRail[midiNumber].shift()
      }
    })
  }, [setHandleNoteDown])

  const generateBlockRail = useCallback(() => {
    renderInfo.current.blockRail = {}

    props.noteEvents.forEach((note: NoteEvent, idx) => {
      const pitch = note[2]
      note[4] = false
      if (renderInfo.current) {
        renderInfo.current.blockRail[pitch] =
          renderInfo.current.blockRail[pitch] || []
        renderInfo.current.blockRail[pitch].push({
          noteEvent: note,
          idx: idx,
        })
      }
    })
  }, [props.noteEvents])

  const noteBlocks = useMemo(() => {
    return props.noteEvents.map((note: NoteEvent, idx) => {
      const startTime = note[0]
      const pitch = note[2]
      const duration = note[1] - note[0]
      const renderSpace = KeyRenderSpace[pitch]

      const renderObject = (
        <mesh
          position={[
            renderSpace.x,
            startTime * Y_LENGTH_PER_SECOND +
              duration * 0.5 * Y_LENGTH_PER_SECOND,
            renderSpace.z,
          ]}
          frustumCulled
        >
          <boxGeometry
            args={[
              renderSpace.w,
              duration * Y_LENGTH_PER_SECOND,
              renderSpace.d,
            ]}
          />
          <meshStandardMaterial
            ref={refNoteBlocks[idx]}
            color={renderSpace.color}
            clippingPlanes={[
              new THREE.Plane(new THREE.Vector3(0, 1, -1), 1.73),
            ]}
            side={THREE.FrontSide}
          />
        </mesh>
      )

      return renderObject
    })
  }, [props.noteEvents, refNoteBlocks])

  useEffect(() => {
    generateBlockRail()
    if (props.noteEvents.length) renderInfo.current.status = 'LOADED'
  }, [generateBlockRail, props.noteEvents])

  useEffect(() => {
    if (playingState === 'stopped') {
      generateBlockRail()
      renderInfo.current.timer = 0
    }
  }, [generateBlockRail, playingState])

  const NoteRender = () => {
    const keyNames = Object.keys(renderInfo.current.blockRail)
    const processBlocks = () => {
      keyNames.forEach((keyName) => {
        if (renderInfo.current.blockRail[keyName].length === 0) return

        const block = renderInfo.current.blockRail[keyName][0]

        if (block.noteEvent[0] <= renderInfo.current.timer) {
          refNoteBlocks[block.idx].current.color.set(0xff0000)

          if (!block.noteEvent[4]) {
            noteDown(block.noteEvent[2])
            block.noteEvent[4] = true
          }
        }

        if (block.noteEvent[1] <= renderInfo.current.timer) {
          noteUp(block.noteEvent[2])
          renderInfo.current.blockRail[keyName].shift()
        }
      })
    }

    const getNotesToWait = (): NoteEvent[] => {
      const notesToWait: NoteEvent[] = []
      keyNames.forEach((keyName) => {
        if (renderInfo.current.blockRail[keyName].length === 0) return

        const block = renderInfo.current.blockRail[keyName][0]
        if (block.noteEvent[0] <= renderInfo.current.timer) {
          notesToWait.push(block.noteEvent)
        }
      })
      return notesToWait
    }

    useFrame((_state, delta) => {
      if (!renderInfo.current || renderInfo.current.status != 'LOADED') return

      if (playingState === 'stopped') return

      if (playingState === 'paused') {
        processBlocks()
        ref.current.position.setY(
          -Y_LENGTH_PER_SECOND * renderInfo.current.timer
        )
        return
      }

      if (playingMode === 'step') {
        const notesToWait: NoteEvent[] = getNotesToWait()
        if (notesToWait.length === 0) {
          renderInfo.current.timer += delta
        }
      } else {
        renderInfo.current.timer += delta
      }

      processBlocks()
      ref.current.position.setY(-Y_LENGTH_PER_SECOND * renderInfo.current.timer)
    })

    return <group ref={ref}>{noteBlocks}</group>
  }

  return (
    <div style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
      <div
        style={{
          width: '70vw',
          height: 'calc(70vh)',
          background: 'grey',
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
          <Suspense>
            <ambientLight position={[10, 0, 0]} intensity={0.3} />
            <pointLight position={[-3, 0, 300]} intensity={3.3} />

            <group
              scale={[1, 1, 1]}
              rotation={[-0.1, 0, 0]}
              position={[0, -3.5, 0]}
            >
              <NoteRender />
              <VirtualPiano />
            </group>
          </Suspense>
        </Canvas>
        <TransportPanel />
      </div>
    </div>
  )
}

export default PianoRoll
