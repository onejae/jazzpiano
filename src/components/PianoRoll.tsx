import { NoteEvent } from 'types/midi'
import * as THREE from 'three'

import { Canvas, useFrame, ThreeElements } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { PitchIndex } from 'constants/notes'

interface PianoRollProps {
  noteEvents: NoteEvent[]
}

function RollBox(props: ThreeElements['mesh']) {
  const ref = useRef<THREE.Mesh>(null!)
  //   useFrame((state, delta) => (ref.current.rotation.x += delta))
  return (
    <>
      <mesh {...props} ref={ref}>
        <boxGeometry args={[0.3, 1, 0.05]} />
        <meshStandardMaterial color={'black'} />
      </mesh>
    </>
  )
}

const BackBoard = (props: ThreeElements['mesh']) => {
  return (
    <mesh {...props}>
      <boxGeometry args={[10, 10.3, 0.1]} />
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

const VirtualPiano = (props: ThreeElements['mesh']) => {
  const [keys] = useState<KeyModel[]>(
    Array(KEY_NUM).map((_, idx) => {
      return new KeyModel(START_MIDI_KEY + idx)
    })
  )
  debugger
  return <mesh {...props}></mesh>
}

const PianoRoll = (props: PianoRollProps) => {
  return (
    <div style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
      <div
        style={{
          width: '30vw',
          height: '80vh',
        }}
      >
        <Canvas>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <group rotation={[-0.2, 0, 0]}>
            <BackBoard position={[0, 0, 0]} />
            <RollBox position={[0, 0, 0.3]} />
          </group>
        </Canvas>
      </div>
    </div>
  )
}

export default PianoRoll
