import { NoteEvent, NoteEventField } from 'types/midi'
import * as THREE from 'three'

import { Canvas, useFrame, ThreeElements } from '@react-three/fiber'
import { Frustum } from 'three'

import { useMemo, useRef, useState } from 'react'
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

const VirtualPiano = (props: ThreeElements['mesh']) => {
  const [keys] = useState<KeyModel[]>(
    Array(KEY_NUM).map((_, idx) => {
      return new KeyModel(START_MIDI_KEY + idx)
    })
  )
  return <mesh {...props}></mesh>
}

const Y_LENGTH_PER_SECOND = 1

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

  // useFrame((state) => {
  //   // Update the frustum with the camera's projection and view matrices
  //   frustum.setFromProjectionMatrix(
  //     state.camera.projectionMatrix.multiply(state.camera.matrixWorldInverse)
  //   )

  //   // Perform frustum culling for each object you want to check
  //   // Example: objects is an array of Three.js objects you want to cull
  //   noteRender.forEach((object) => {
  //     if (frustum.intersectsObject(object)) {
  //       // Object is visible, perform rendering or update logic here
  //     } else {
  //       // Object is not visible, you can skip rendering or apply optimizations
  //     }
  //   })
  // })

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
            <BackBoard position={[0, 0, 0]} />
            {/* {noteRender} */}
            <NoteRender />
          </group>
        </Canvas>
      </div>
    </div>
  )
}

export default PianoRoll
