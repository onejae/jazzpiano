import { NoteEvent, NoteEventField } from 'types/midi'
import * as THREE from 'three'

import { Canvas, useFrame, ThreeElements, Vector3 } from '@react-three/fiber'

import { useEffect, useMemo, useRef, useState } from 'react'
import { PitchIndex } from 'constants/notes'

interface PianoRollProps {
  noteEvents: NoteEvent[]
}

function RollBox(props: ThreeElements['mesh']) {
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

interface KeyRenderSpaceType {
  x: number
  y: number
  z: number
  w: number
  h: number
  d: number
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
  }

  lastX = lastX + (key.isWhiteKey() ? WHITEKEY_WIDTH + PADDING_X : 0)
}

const VirtualPiano = (props: ThreeElements['mesh']) => {
  return (
    <group position={props.position}>
      {keys.map((key: KeyModel, idx) => {
        const renderSpace = KeyRenderSpace[key.midiNumber]
        return (
          <mesh position={[renderSpace.x, renderSpace.y, renderSpace.z]}>
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

const PianoRoll = (props: PianoRollProps) => {
  const ref = useRef<THREE.Group>(null!)

  const NoteRender = () => {
    useFrame((state, delta) => {
      ref.current.position.y += -3 * delta
    })

    return (
      <group ref={ref}>
        {props.noteEvents.map((note: NoteEvent, idx) => {
          const startTime = note[NoteEventField.start_s]
          const pitch = note[NoteEventField.pitch]
          return (
            <RollBox
              position={[
                -5 + (pitch - START_MIDI_KEY) * 0.15,
                startTime * 2,
                0.03,
              ]}
              frustumCulled
            />
          )
        })}
      </group>
    )
  }

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
          <ambientLight position={[10, 0, 0]} intensity={0.3} />
          <pointLight position={[-3, 0, 300]} intensity={3.3} />

          <group scale={[1, 1, 1]} rotation={[-0.35, 0, 0]}>
            {/* <BackBoard position={[0, 0, -0.1]} /> */}
            <NoteRender />
            <VirtualPiano scale={[3, 3, 3]} position={[-0.3, -4.2, -2]} />
          </group>
        </Canvas>
      </div>
    </div>
  )
}

export default PianoRoll
