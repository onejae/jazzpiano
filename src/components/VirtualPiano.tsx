import { ThreeElements, Vector3 } from '@react-three/fiber'
import { useCallback, useEffect, useRef, useState } from 'react'
import { START_MIDI_KEY } from '@constants/keys'
import { KeyModel, keyModels } from '@libs/midiControl'
import { SplendidGrandPiano } from 'smplr'
import { useMidiControl } from '@providers/MidiControl'
import { Text } from '@react-three/drei'

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

let TOTAL_WIDTH = 0
const WHITEKEY_WIDTH = 0.5
const WHITEKEY_HEIGHT = 1.3
const BLACKKEY_WIDTH = 0.3
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

for (let lastX = 0, i = 0; i < keyModels.length; i++) {
  const key = keyModels[i]
  const [w, h, d] = key.isWhiteKey()
    ? [WHITEKEY_WIDTH, WHITEKEY_HEIGHT, 0.2]
    : [BLACKKEY_WIDTH, BLACKKEY_HEIGHT, 0.25]

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
    name: key.keyName,
    color: key.isWhiteKey() ? 'white' : 'black',
  }

  lastX = lastX + (key.isWhiteKey() ? WHITEKEY_WIDTH + PADDING_X : 0)

  if (i < keyModels.length - 1) TOTAL_WIDTH = lastX
}

Object.keys(KeyRenderSpace).forEach((key) => {
  KeyRenderSpace[key].x -= TOTAL_WIDTH * 0.5
})

export const VirtualPiano = (props: ThreeElements['mesh']) => {
  const refPianoKeys = useRef([])
  const {
    refHandleMidiNoteDown,
    refHandleMidiNoteUp,
    setHandlePreviewNoteDown,
    setHandlePreviewNoteUp,
  } = useMidiControl()

  const [octaveShift, setOctaveShift] = useState(0)

  const handleKeyDown = useCallback(
    (ev: KeyboardEvent) => {
      if (ev.code === 'ArrowLeft') {
        setOctaveShift(-1)
      } else if (ev.code === 'ArrowRight') {
        setOctaveShift(1)
      } else {
        const midiNumber = KeyMidiTable[ev.key] + 12 * octaveShift
        const pressedKey = keyModels.find((v) => v.midiNumber === midiNumber)

        if (pressedKey && pressedKey.pressed === false) {
          pressedKey.pressed = true

          refPianoKeys.current[midiNumber - START_MIDI_KEY].color.set('blue')

          pianoPlayer.start({
            note: midiNumber,
            velocity: 80,
          })

          if (refHandleMidiNoteDown.current) {
            refHandleMidiNoteDown.current(pressedKey.midiNumber, 80)
          }
        }
      }
    },
    [octaveShift, refHandleMidiNoteDown]
  )

  const handleKeyUp = useCallback(
    (ev: KeyboardEvent) => {
      if (ev.code === 'ArrowLeft' || ev.code === 'ArrowRight') {
        setOctaveShift(0)
      } else {
        const midiNumber = KeyMidiTable[ev.key] + 12 * octaveShift
        const pressedKey = keyModels.find((v) => v.midiNumber === midiNumber)

        if (pressedKey) {
          pressedKey.pressed = false
          refPianoKeys.current[midiNumber - START_MIDI_KEY].color.set(
            keyModels[midiNumber - START_MIDI_KEY].isWhiteKey()
              ? 'white'
              : 'black'
          )

          pianoPlayer.stop(midiNumber)

          if (refHandleMidiNoteUp.current) {
            refHandleMidiNoteUp.current(pressedKey.midiNumber, 80)
          }
        }
      }
    },
    [refHandleMidiNoteUp, octaveShift]
  )

  useEffect(() => {
    setHandlePreviewNoteDown((m) => {
      refPianoKeys.current[m - START_MIDI_KEY].color.set('blue')

      pianoPlayer.start({
        note: m,
        velocity: 80,
      })
    })

    setHandlePreviewNoteUp((m) => {
      refPianoKeys.current[m - START_MIDI_KEY].color.set(
        keyModels[m - START_MIDI_KEY].isWhiteKey() ? 'white' : 'black'
      )

      pianoPlayer.stop(m)
    })
  }, [setHandlePreviewNoteDown, setHandlePreviewNoteUp])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)

      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  const refPiano = useRef()

  return (
    <group ref={refPiano} position={props.position}>
      {keyModels.map((key: KeyModel, idx) => {
        const renderSpace = KeyRenderSpace[key.midiNumber]
        return (
          <mesh
            position={[renderSpace.x, renderSpace.y, renderSpace.z]}
            key={idx}
          >
            <boxGeometry args={[renderSpace.w, renderSpace.h, renderSpace.d]} />
            <meshStandardMaterial
              ref={(el) => {
                refPianoKeys.current[idx] = el
              }}
              color={key.isWhiteKey() ? 'white' : 'black'}
            ></meshStandardMaterial>
            <Text
              scale={[0.1, 0.1, 0.1]}
              position={key.isWhiteKey() ? [0, -0.4, 0.33] : [0, -0.2, 0.23]}
              color={key.isWhiteKey() ? 'black' : 'white'}
              anchorX="center"
              anchorY="middle"
            >
              {/* {key.keyName} */}
            </Text>
          </mesh>
        )
      })}{' '}
    </group>
  )
}
