import * as THREE from 'three'
import { NoteEvent } from 'types/midi'

import { Canvas, ThreeElements, Vector3, useFrame } from '@react-three/fiber'

import { Physics } from '@react-three/rapier'
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
const BUFFER_SECONDS_FOR_CANDIDATES = 0.5

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

// const rayCaster = new Raycaster(new _Vector3(-15, 0, 0), new _Vector3(1, 0, 0))

const VirtualPiano = (props: ThreeElements['mesh']) => {
  // const [ray, setRay] = useState(null)

  // useEffect(() => {
  //   if (!ray) return
  //   const intersect = ray.intersectObject(box)
  //   console.log(intersect)
  // }, [ray])

  return (
    <group position={props.position}>
      <mesh position={[0, WHITEKEY_HEIGHT * 0.5, 0]}>
        {/* <boxGeometry args={[20, 0.0, 1]} /> */}
      </mesh>
      {/* <raycaster
        ref={setRay}
        // ray={{
        //   origin: new _Vector3(-3, 0, 0),
        //   direction: new _Vector3(1, 0, 0),
        // }}
        ray={new Ray(new _Vector3(-3, 0, 0), new _Vector3(1, 0, 0))}
      ></raycaster> */}
      {keys.map((key: KeyModel, idx) => {
        const renderSpace = KeyRenderSpace[key.midiNumber]
        return (
          <mesh
            raycast={(a, b) => {}}
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

const PianoRoll = (props: PianoRollProps) => {
  const ref = useRef<THREE.group>(null!)
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState<number>(0)
  const refNoteBlocks = Array.from({ length: 10000 }, () =>
    useRef<THREE.mesh>(null!)
  )
  const [checkFromIndex, setCheckFromIndex] = useState(0)

  const noteBlocks = useMemo(() => {
    return props.noteEvents.map((note: NoteEvent, idx) => {
      const startTime = note[0]
      const pitch = note[2]
      const duration = note[1] - note[0]
      const renderSpace = KeyRenderSpace[pitch]
      return (
        <mesh
          position={[
            renderSpace.x,
            5 + startTime * Y_LENGTH_PER_SECOND,
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
    })
  }, [props.noteEvents, refNoteBlocks])

  const NoteRender = () => {
    useFrame((state, delta) => {
      ref.current.translateY(-3 * delta)

      // get check candidates
      const candidates: THREE.mesh[] = []

      for (let i = checkFromIndex; i <= props.noteEvents.length; i++) {
        const noteEvent = props.noteEvents[i]

        if (
          noteEvent[0] >= currentTimeSeconds + BUFFER_SECONDS_FOR_CANDIDATES &&
          noteEvent[1] + BUFFER_SECONDS_FOR_CANDIDATES <= currentTimeSeconds
        ) {
          candidates.push(refNoteBlocks[i])
        }
      }
      //

      // if (refNoteBlocks[1].current) {
      //   const vector = new THREE.Vector3()
      //   refNoteBlocks[1].current.getWorldPosition(vector)

      //   console.log(vector)
      // }

      // const test = refNoteBlocks.map((ref) => {
      // return ref.current
      // })

      // if (refNoteBlocks.length && refNoteBlocks[0].current) {
      //   const rayCaster = new Raycaster()
      //   rayCaster.set(new _Vector3(-50, -3, -2), new _Vector3(1, 0, 0))
      //   const a = rayCaster.intersectObjects(test)

      //   if (a.length) {
      //     a.forEach((block) => {
      //       block.object.material.color.set(0xff0000)
      //     })
      //   }
      // }
    })

    return <group ref={ref}>{noteBlocks}</group>
  }

  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new _Vector3(0, 0, 10),
    new _Vector3(0, 0, -1),
  ])

  const ref2 = useRef<THREE.group>(null!)

  useEffect(() => {
    console.log('------------------')

    const vector = new THREE.Vector3()

    if (ref2.current) {
      ref2.current.getWorldPosition(vector)
      console.log(vector)
    }
  }, [ref2.current])

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
            <Physics gravity={[0, 0, 0]} interpolate={false} colliders={false}>
              <ambientLight position={[10, 0, 0]} intensity={0.3} />
              <pointLight position={[-3, 0, 300]} intensity={3.3} />

              <group
                scale={[1, 1, 1]}
                rotation={[-0.0, 0, 0]}
                position={[0, -4.5, 0]}
                ref={ref2}
              >
                <NoteRender />
                <VirtualPiano />
              </group>
            </Physics>
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}

export default PianoRoll
