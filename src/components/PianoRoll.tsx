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

const WHITEKEY_WIDTH = 0.2
const WHITEKEY_HEIGHT = 1
const BLACKKEY_WIDTH = 0.1
const BLACKKEY_HEIGHT = 0.7

const VirtualPiano = (props: ThreeElements['mesh']) => {
  const [keys, setKeys] = useState<KeyModel[]>(
    Array(KEY_NUM)
      .fill('')
      .map((_, idx) => new KeyModel(START_MIDI_KEY + idx))
  )

  useEffect(() => {
    keys.forEach((key) => console.log(key))
  }, [keys])

  return (
    <>
      {keys.map((key: KeyModel, idx) => {
        const args: [
          width?: number,
          height?: number,
          depth?: number,
          widthSegments?: number,
          heightSegments?: number,
          depthSegments?: number
        ] = key.isWhiteKey()
          ? [WHITEKEY_WIDTH, WHITEKEY_HEIGHT, 0.05]
          : [BLACKKEY_WIDTH, BLACKKEY_HEIGHT, 0.05]

        const position: Vector3 = key.isWhiteKey()
          ? [-5 + idx * 0.2, 0, 0]
          : [-5 + idx * 0.1, 0, 1]
        return (
          <mesh position={position}>
            <boxGeometry args={args} />
            <meshStandardMaterial
              color={key.isWhiteKey() ? 'white' : 'black'}
            />
          </mesh>
        )
      })}{' '}
    </>
  )
}

const Y_LENGTH_PER_SECOND = 1

const PianoRoll = (props: PianoRollProps) => {
  const ref = useRef<THREE.Group>(null!)
  const NoteRender = () => {
    useFrame((state, delta) => {
      // ref.current.position.y += -3 * delta
    })
    return (
      <>
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
      </>
    )
  }

  return (
    <div style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
      <div
        style={{
          width: '70vw',
          height: 'calc(75vh)',
          // background: 'red',
        }}
      >
        <Canvas>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <group scale={[1, 1, 1]} rotation={[-0.6, 0, 0]}>
            {/* <BackBoard position={[0, 0, 0]} /> */}
            {/* {noteRender} */}
            <NoteRender />

            <VirtualPiano scale={[3, 3, 3]} position={[1, 2, 0]} />
          </group>
        </Canvas>
      </div>
    </div>
  )
}

export default PianoRoll
