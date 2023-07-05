import { ThreeElements, Vector3 } from '@react-three/fiber'
import React, { useCallback, useEffect, useRef } from 'react'
import { KEY_NUM, START_MIDI_KEY } from '@constants/keys'
import { KeyModel, keyModels } from '@libs/midiControl'
import { SplendidGrandPiano } from 'smplr'
import { useMidiControl } from '@providers/MidiControl'

const KeyMidiTable: { [key: string]: number } = {
  z: 48,
  s: 49,
  x: 50,
  d: 51,
  c: 52,
  v: 53,
  g: 54,
  b: 55,
  h: 56,
  n: 57,
  j: 58,
  m: 59,
  q: 60,
  '2': 61,
  w: 62,
  '3': 63,
  e: 64,
  r: 65,
  '5': 66,
  t: 67,
  '6': 68,
  y: 69,
  '7': 70,
  u: 71,
}

const context = new AudioContext()
const pianoPlayer = new SplendidGrandPiano(context, { decayTime: 1.2 })

pianoPlayer.loaded().then(() => {
  console.log('--- virtual piano player is ready')
})

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
  color: string
  name: string
}

export const KeyRenderSpace: { [key: number]: KeyRenderSpaceType } = {}

for (let lastX = START_X, i = 0; i < keyModels.length; i++) {
  const key = keyModels[i]
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

export const useVirtualPiano = () => {
  const refPianoKeys = Array.from({ length: KEY_NUM }, () =>
    useRef<THREE.Mesh>(null!)
  )

  const noteDown = useCallback((midiNumber: number, velocity = 80) => {
    pianoPlayer.start({
      note: midiNumber,
      velocity: velocity,
    })
  }, [])
  const noteUp = useCallback((midiNumber: number) => {
    pianoPlayer.stop(midiNumber)
  }, [])

  return { refPianoKeys, noteDown, noteUp }
}

export const VirtualPiano = (props: ThreeElements['mesh']) => {
  const { refPianoKeys, noteDown, noteUp } = useVirtualPiano()
  const { test, handleNoteDown, handleNoteUp } = useMidiControl()

  const handleKeyDown = useCallback(
    (ev: KeyboardEvent) => {
      const midiNumber = KeyMidiTable[ev.key]
      const pressedKey = keyModels.find((v) => v.midiNumber === midiNumber)

      if (pressedKey && pressedKey.pressed === false) {
        pressedKey.pressed = true

        refPianoKeys[midiNumber - START_MIDI_KEY].current.material.color.set(
          'blue'
        )

        noteDown(pressedKey.midiNumber, 80)

        if (handleNoteDown) {
          handleNoteDown(pressedKey.midiNumber)
        }
      }
    },
    [noteDown, refPianoKeys]
  )

  const handleKeyUp = useCallback(
    (ev: KeyboardEvent) => {
      const midiNumber = KeyMidiTable[ev.key]
      const pressedKey = keyModels.find((v) => v.midiNumber === midiNumber)

      if (pressedKey) {
        pressedKey.pressed = false
        refPianoKeys[midiNumber - START_MIDI_KEY].current.material.color.set(
          keyModels[midiNumber - START_MIDI_KEY].isWhiteKey()
            ? 'white'
            : 'black'
        )

        noteUp(pressedKey.midiNumber)

        // if (handleNoteUp) {
        //   handleNoteUp(pressedKey.midiNumber)
        // }
      }
    },
    [noteUp, refPianoKeys]
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
      {keyModels.map((key: KeyModel, idx) => {
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
