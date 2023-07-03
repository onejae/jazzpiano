import * as THREE from 'three'
import { NoteEvent } from 'types/midi'

import {
  Canvas,
  ThreeElements,
  Vector3,
  useFrame,
  invalidate,
} from '@react-three/fiber'

import { PitchIndex } from 'constants/notes'
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { Vector3 as _Vector3, Ray, Raycaster } from 'three'

import { SplendidGrandPiano, Soundfont } from 'smplr'

const context = new AudioContext()
const pianoPlayer = new SplendidGrandPiano(context, { decayTime: 1.2 })

pianoPlayer.loaded().then(() => {
  console.log('--- piano is ready')
})

interface PianoRollProps {
  noteEvents: NoteEvent[]
}

const KEY_NUM = 88
const START_MIDI_KEY = 21

class KeyModel {
  midiNumber: number
  octave: number
  noteName: string
  pressed: boolean

  constructor(midiNumber: number) {
    this.midiNumber = midiNumber
    this.noteName = KeyModel.getNoteFromMidiNumber(midiNumber)
    this.octave = KeyModel.getOctaveFromMidiNumber(midiNumber)
    this.pressed = false
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
    ? [lastX, -WHITEKEY_HEIGHT * 0.5, -0.1]
    : [lastX - BLACKKEY_WIDTH * 0.8, -BLACKKEY_HEIGHT * 0.5, 0.0001]

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

const KeyMidiTable: { [key: string]: number } = {
  z: 36,
  s: 37,
  x: 38,
  d: 39,
  c: 40,
  v: 41,
  g: 42,
  b: 43,
  h: 44,
  n: 45,
  j: 46,
  m: 47,
  q: 48,
  '2': 49,
  w: 50,
  '3': 51,
  e: 52,
  r: 53,
  '5': 54,
  t: 55,
  '6': 56,
  y: 57,
  '7': 58,
  u: 59,
}

const VirtualPiano = (props: ThreeElements['mesh']) => {
  const refPianoKeys = Array.from({ length: KEY_NUM }, () =>
    useRef<THREE.Mesh>(null!)
  )

  const handleKeyDown = useCallback(
    (ev: KeyboardEvent) => {
      const midiNumber = KeyMidiTable[ev.key]
      const pressedKey = keys.find((v) => v.midiNumber === midiNumber)

      if (pressedKey) {
        pressedKey.pressed = true

        refPianoKeys[midiNumber - START_MIDI_KEY].current.material.color.set(
          'blue'
        )
      }
    },
    [refPianoKeys]
  )

  const handleKeyUp = useCallback(
    (ev: KeyboardEvent) => {
      const midiNumber = KeyMidiTable[ev.key]
      const pressedKey = keys.find((v) => v.midiNumber === midiNumber)

      if (pressedKey) {
        pressedKey.pressed = false
        refPianoKeys[midiNumber - START_MIDI_KEY].current.material.color.set(
          keys[midiNumber - START_MIDI_KEY].isWhiteKey() ? 'white' : 'black'
        )
      }
    },
    [refPianoKeys]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)

      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  return (
    <group position={props.position}>
      <mesh position={[0, WHITEKEY_HEIGHT * 0.5, 0]}></mesh>
      {keys.map((key: KeyModel, idx) => {
        const renderSpace = KeyRenderSpace[key.midiNumber]
        return (
          <mesh
            position={[renderSpace.x, renderSpace.y, renderSpace.z]}
            key={idx}
            ref={refPianoKeys[idx]}
          >
            <boxGeometry args={[renderSpace.w, renderSpace.h, renderSpace.d]} />
            <meshStandardMaterial
              color={key.isWhiteKey() ? 'white' : 'black'}
            ></meshStandardMaterial>
          </mesh>
        )
      })}{' '}
    </group>
  )
}

interface RenderInfo {
  timer: number
  indexFrom: number
  blockRail: { [key: string]: { noteEvent: NoteEvent; idx: number }[] }
  status: 'INIT' | 'LOADED' | 'PLAYING'
}

const PianoRoll = (props: PianoRollProps) => {
  const ref = useRef<THREE.Group>(null!)
  const refNoteBlocks = Array.from({ length: 10000 }, () =>
    useRef<THREE.Mesh>(null!)
  )
  const renderInfo = useRef<RenderInfo>({
    timer: 0,
    indexFrom: 0,
    blockRail: {},
    status: 'INIT',
  })
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
          ref={refNoteBlocks[idx]}
        >
          <boxGeometry
            args={[
              renderSpace.w,
              duration * Y_LENGTH_PER_SECOND,
              renderSpace.d,
            ]}
          />
          <meshStandardMaterial
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

    if (props.noteEvents.length) renderInfo.current.status = 'LOADED'
  }, [props.noteEvents, refNoteBlocks])

  const NoteRender = () => {
    useFrame((state, delta) => {
      if (!renderInfo.current || renderInfo.current.status != 'LOADED') return
      ref.current.position.setY(-Y_LENGTH_PER_SECOND * renderInfo.current.timer)

      const keys = Object.keys(renderInfo.current.blockRail)

      keys.forEach((key) => {
        if (renderInfo.current.blockRail[key].length === 0) return

        const block = renderInfo.current.blockRail[key][0]

        if (block === undefined) {
          return
        }

        if (block.noteEvent[0] <= renderInfo.current.timer) {
          refNoteBlocks[block.idx].current.material.color.set(0xff0000)

          if (block.noteEvent[4] === false) {
            pianoPlayer.start({
              note: block.noteEvent[2],
              velocity: block.noteEvent[3] * 127,
              duration: block.noteEvent[1] - block.noteEvent[0],
            })
            block.noteEvent[4] = true
          }
        }

        if (block.noteEvent[1] <= renderInfo.current.timer) {
          renderInfo.current.blockRail[key].shift()
        }
      }, [])

      renderInfo.current.timer += delta
    })

    return <group ref={ref}>{noteBlocks}</group>
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
      </div>
    </div>
  )
}

export default PianoRoll
