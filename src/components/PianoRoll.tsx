import * as THREE from 'three'
import { NoteEvent } from 'types/midi'

import { Canvas, ThreeElements, Vector3, useFrame } from '@react-three/fiber'

import { PitchIndex } from 'constants/notes'
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'

import { Vector3 as _Vector3, Ray, Raycaster } from 'three'

interface PianoRollProps {
  noteEvents: NoteEvent[]
}

function RollEvent(props: ThreeElements['mesh']) {
  return (
    <>
      <mesh {...props}>
        <boxGeometry args={[0.3, 1, 0.05]} />
        <meshStandardMaterial color={'black'} />
      </mesh>
    </>
  )
}

const BackBoard = (props: ThreeElements['mesh']) => {
  return (
    <mesh {...props}>
      <boxGeometry args={[10, 10, 0.1]} />
      <meshStandardMaterial color={'orange'} />
    </mesh>
  )
}

const KEY_NUM = 88
const START_MIDI_KEY = 21

class KeyModel {
  midiNumber: number
  octave: number
  noteName: string

  constructor(midiNumber: number) {
    this.midiNumber = midiNumber
    this.noteName = KeyModel.getNoteFromMidiNumber(midiNumber)
    this.octave = KeyModel.getOctaveFromMidiNumber(midiNumber)
  }

  static getOctaveFromMidiNumber = (midiNumber: number): number => {
    return Math.floor(midiNumber / 12 - 1)
  }

  static getNoteFromMidiNumber = (midiNumber: number): string => {
    const PitchName = [
      'C',
      'C#',
      'D',
      'D#',
      'E',
      'F',
      'F#',
      'G',
      'G#',
      'A',
      'A#',
      'B',
    ]

    const octave = KeyModel.getOctaveFromMidiNumber(midiNumber)
    const index = midiNumber % 12

    return PitchName[index] + octave.toString()
  }

  getPitchIndex(): PitchIndex {
    return this.midiNumber % 12
  }

  getIndexInOctave(): number {
    return this.getPitchIndex()
  }

  isWhiteKey(): boolean {
    const pitchName = this.getPitchIndex()

    switch (pitchName) {
      case PitchIndex.A:
      case PitchIndex.B:
      case PitchIndex.C:
      case PitchIndex.D:
      case PitchIndex.E:
      case PitchIndex.F:
      case PitchIndex.G:
        return true
    }

    return false
  }
}

const Y_LENGTH_PER_SECOND = 1
const START_X = -8
const WHITEKEY_WIDTH = 0.3
const WHITEKEY_HEIGHT = 1.3
const BLACKKEY_WIDTH = 0.2
const BLACKKEY_HEIGHT = 0.9
const PADDING_X = 0.03
const BUFFER_SECONDS_FOR_CANDIDATES = 0.0

interface KeyRenderSpaceType {
  x: number
  y: number
  z: number
  w: number
  h: number
  d: number
  color: string
  name: string
}

const KeyRenderSpace: { [key: number]: KeyRenderSpaceType } = {}
const keys = Array(KEY_NUM)
  .fill('')
  .map((_, idx) => new KeyModel(START_MIDI_KEY + idx))

for (let lastX = START_X, i = 0; i < keys.length; i++) {
  const key = keys[i]
  const [w, h, d] = key.isWhiteKey()
    ? [WHITEKEY_WIDTH, WHITEKEY_HEIGHT, 0.25]
    : [BLACKKEY_WIDTH, BLACKKEY_HEIGHT, 0.15]

  const position: Vector3 = key.isWhiteKey()
    ? [lastX, 0, -0.1]
    : [lastX - BLACKKEY_WIDTH * 0.8, 0.2, 0.0001]

  KeyRenderSpace[key.midiNumber] = {
    x: position[0],
    y: position[1],
    z: position[2],
    w: w,
    h: h,
    d: d,
    name: key.noteName,
    color: key.isWhiteKey() ? 'white' : 'black',
  }

  lastX = lastX + (key.isWhiteKey() ? WHITEKEY_WIDTH + PADDING_X : 0)
}

const VirtualPiano = (props: ThreeElements['mesh']) => {
  return (
    <group position={props.position}>
      <mesh position={[0, WHITEKEY_HEIGHT * 0.5, 0]}>
        {/* <boxGeometry args={[20, 0.0, 1]} /> */}
      </mesh>
      {keys.map((key: KeyModel, idx) => {
        const renderSpace = KeyRenderSpace[key.midiNumber]
        return (
          <mesh
            position={[renderSpace.x, renderSpace.y, renderSpace.z]}
            key={idx}
          >
            <boxGeometry args={[renderSpace.w, renderSpace.h, renderSpace.d]} />
            <meshStandardMaterial
              color={key.isWhiteKey() ? 'white' : 'black'}
            />
          </mesh>
        )
      })}{' '}
    </group>
  )
}

interface RenderInfo {
  timer: number
  indexFrom: number
  blockRail: { [key: number]: NoteEvent[] }
}

const PianoRoll = (props: PianoRollProps) => {
  const ref = useRef<THREE.group>(null!)
  const refNoteBlocks = Array.from({ length: 10000 }, () =>
    useRef<THREE.mesh>(null!)
  )
  const renderInfo = useRef<RenderInfo>({
    timer: 0,
    indexFrom: 0,
    blockRail: {},
  })
  const [checkFromIndex, setCheckFromIndex] = useState(0)

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
            startTime * Y_LENGTH_PER_SECOND,
            renderSpace.z,
          ]}
          frustumCulled
          ref={refNoteBlocks[idx]}
        >
          <boxGeometry
            args={[
              renderSpace.w,
              duration * Y_LENGTH_PER_SECOND,
              renderSpace.d,
            ]}
          />
          <meshStandardMaterial color={renderSpace.color} />
        </mesh>
      )

      return renderObject
    })
  }, [props.noteEvents, refNoteBlocks])

  useEffect(() => {
    props.noteEvents.forEach((note: NoteEvent, idx) => {
      const pitch = note[2]
      if (renderInfo.current) {
        renderInfo.current.blockRail[pitch] =
          renderInfo.current.blockRail[pitch] || []
        renderInfo.current.blockRail[pitch].push(note)
      }
    })
  }, [props.noteEvents])

  const NoteRender = () => {
    useFrame((state, delta) => {
      if (!renderInfo.current) return
      ref.current.translateY(delta * -Y_LENGTH_PER_SECOND)

      for (let i = checkFromIndex; i < props.noteEvents.length; i++) {
        const noteEvent = props.noteEvents[i]

        if (noteEvent[0] <= renderInfo.current.timer) {
          refNoteBlocks[i].current.material.color.set(0xff0000)
        }
      }

      renderInfo.current.timer += delta
    })

    return <group ref={ref}>{noteBlocks}</group>
  }

  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new _Vector3(0, 0, 10),
    new _Vector3(0, 0, -1),
  ])

  const ref2 = useRef<THREE.group>(null!)

  const rayVector = new _Vector3(-50, -3, 0)
  // rayVector.applyAxisAngle(new _Vector3(1, 0, 0), -0.3)
  const ray = new Ray(rayVector, new _Vector3(1, 0, 0))
  const rayRef = useRef<THREE.Raycaster>(null!)

  return (
    <div style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
      <div
        style={{
          width: '70vw',
          height: 'calc(75vh)',
          background: 'grey',
        }}
      >
        <Canvas
          camera={{
            position: [0, 0, 13],
            fov: 45,
            near: 0.1,
            far: 100,
          }}
        >
          <Suspense>
            <ambientLight position={[10, 0, 0]} intensity={0.3} />
            <pointLight position={[-3, 0, 300]} intensity={3.3} />

            <group
              scale={[1, 1, 1]}
              rotation={[-0.3, 0, 0]}
              position={[0, -4.5, 0]}
              ref={ref2}
            >
              <raycaster ray={ray} ref={rayRef} />
              <NoteRender />
              <VirtualPiano />
            </group>
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}

export default PianoRoll
