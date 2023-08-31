import * as THREE from 'three'
import { NoteEvent } from 'types/midi'

import { ThreeElements, useFrame } from '@react-three/fiber'

import { useCallback, useEffect, useMemo, useRef } from 'react'

import { KeyRenderSpace } from '@components/VirtualPiano'
import { useMidiControl } from '../providers/MidiControl'
import { useTransport } from '@providers/TransportProvider'

import sessionPlayer from '@libs/sessions'

interface PianoRollProps {
  noteEvents: NoteEvent[]
}

const Y_LENGTH_PER_SECOND = 1

interface Block {
  noteEvent: NoteEvent
  idx: number
}

interface RenderInfo {
  timer: number
  indexFrom: number
  blockRail: { [key: string]: Block[] }
  status: 'INIT' | 'LOADED' | 'PLAYING'
  pressedMidiKeys: number[]
}

interface ScoreCriterion {
  [timeRange: number]: { score: number; name: string }
}

const ScoreCriterionTable: ScoreCriterion = {
  0.1: { score: 1, name: 'perfect' },
  0.3: { score: 0.8, name: 'nice' },
  0.5: { score: 0.5, name: 'good' },
  0.9: { score: 0.1, name: 'poor' },
}

class TimeTracker {
  notes: NoteEvent[]
  cursor: number

  constructor(notes: NoteEvent[]) {
    this.cursor = 0
    this.notes = notes
  }

  getNotesByTime(time: number): NoteEvent[] {
    const notes = []

    while (this.cursor < this.notes.length) {
      const candidate = this.notes[this.cursor]

      if (candidate.start_s <= time) {
        notes.push(candidate)
        this.cursor += 1
      } else {
        break
      }
    }

    return notes
  }

  init() {
    this.cursor = 0
  }
}

const PianoRoll = (props: PianoRollProps & ThreeElements['mesh']) => {
  const ref = useRef<THREE.Group>(null!)
  const refNoteBlocks = useRef({})
  const refRailMaterials = useRef({})
  const {
    setHandleMidiNoteDown,
    setHandleMidiNoteUp,
    refHandlePreviewNoteDown,
    refHandlePreviewNoteUp,
  } = useMidiControl()
  const { playingState, playingMode, railAngle } = useTransport()

  const refSessionTracker = useRef<TimeTracker>(null)
  console.log(refSessionTracker)

  const renderInfo = useRef<RenderInfo>({
    timer: 0,
    indexFrom: 0,
    blockRail: {},
    status: 'INIT',
    pressedMidiKeys: [],
  })

  const scoreUserTouch = (block: Block, timing: number) => {
    const timingGap = Math.abs(block.noteEvent.start_s - timing)
    const belongingTiming = Object.keys(ScoreCriterionTable).find(
      (v) => Number(v) >= timingGap
    )

    if (belongingTiming) {
      return ScoreCriterionTable[belongingTiming].score
    } else {
      // missed
      return -1
    }
  }

  useEffect(() => {
    setHandleMidiNoteDown(() => (midiNumber: number) => {
      if (renderInfo.current.pressedMidiKeys.includes(midiNumber) === false) {
        renderInfo.current.pressedMidiKeys.push(midiNumber)
      }
      if (
        !(midiNumber in renderInfo.current.blockRail) ||
        renderInfo.current.blockRail[midiNumber].length === 0
      )
        return
      const block = renderInfo.current.blockRail[midiNumber][0]
      // score the touch
      const score = scoreUserTouch(block, renderInfo.current.timer)
      console.log(score)
      // end of scoring
      if (block.noteEvent.start_s <= renderInfo.current.timer) {
        renderInfo.current.blockRail[midiNumber].shift()
      }
    })
    setHandleMidiNoteUp(() => (midiNumber: number) => {
      renderInfo.current.pressedMidiKeys =
        renderInfo.current.pressedMidiKeys.filter((v) => v != midiNumber)
      refRailMaterials.current[midiNumber].color.set(0xffffff)
    })
  }, [setHandleMidiNoteDown, setHandleMidiNoteUp])

  const generateBlockRail = useCallback(() => {
    renderInfo.current.blockRail = {}

    // refSessionTracker.current = new TimeTracker(
    // props.noteEvents.filter((v) => v.family != 'piano')
    // )

    props.noteEvents
      // .filter((v) => v.family === 'piano')
      .forEach((note: NoteEvent, idx) => {
        const pitch = note.pitch
        note.played = false
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
    return props.noteEvents
      .filter((v) => v.family === 'piano')
      .map((note: NoteEvent, idx) => {
        const startTime = note.start_s
        const pitch = note.pitch
        const duration = note.end_s - note.start_s
        const renderSpace = KeyRenderSpace[pitch]
        const clippingPlane = new THREE.Plane(
          new THREE.Vector3(0, 1, 0).applyAxisAngle(
            new THREE.Vector3(1, 0, 0),
            railAngle
          ),
          4.2
        )

        const renderObject = (
          <mesh
            key={idx}
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
              ref={(ref) => (refNoteBlocks.current[idx] = ref)}
              color={renderSpace.color}
              clippingPlanes={[clippingPlane]}
              side={THREE.DoubleSide}
            />
          </mesh>
        )

        return renderObject
      })
  }, [props.noteEvents, railAngle])

  useEffect(() => {
    generateBlockRail()
    if (props.noteEvents.length) renderInfo.current.status = 'LOADED'
  }, [generateBlockRail, props.noteEvents])

  const processSession = () => {
    // const sessionNotes = refSessionTracker.current.getNotesByTime(
    // renderInfo.current.timer
    // )
    // props.noteEvents
    //   .filter((v) => v.family != 'piano')
    //   .forEach((note) => {
    //     sessionPlayer.noteOn(
    //       note.family,
    //       note.pitch,
    //       note.velocity,
    //       note.start_s
    //     )
    //   })
    // sessionNotes.forEach((note) => {
    // sessionPlayer.noteOn(note.family, note.pitch, note.velocity)
    // })
    // console.log(sessionNotes)
  }

  useEffect(() => {
    if (playingState === 'stopped') {
      generateBlockRail()

      renderInfo.current.timer = 0
    } else {
      processSession()
    }
  }, [generateBlockRail, playingState, processSession])

  const NoteRender = () => {
    const keyNames = Object.keys(renderInfo.current.blockRail)
    const processBlocks = () => {
      keyNames.forEach((keyName) => {
        if (renderInfo.current.blockRail[keyName].length === 0) return

        const block = renderInfo.current.blockRail[keyName][0]

        if (block.noteEvent.start_s <= renderInfo.current.timer) {
          if (!block.noteEvent.played && refHandlePreviewNoteDown.current) {
            if (block.noteEvent.family === 'piano') {
              // refNoteBlocks.current[block.idx].color.set(0xff0000)
              refHandlePreviewNoteDown.current(
                block.noteEvent.pitch,
                block.noteEvent.velocity
              )
            } else {
              sessionPlayer.noteOn(
                block.noteEvent.family,
                block.noteEvent.pitch,
                block.noteEvent.velocity,
                0
              )
            }

            block.noteEvent.played = true
          }
        }

        if (block.noteEvent.end_s <= renderInfo.current.timer) {
          if (refHandlePreviewNoteUp.current && playingMode === 'preview')
            if (block.noteEvent.family === 'piano') {
              refHandlePreviewNoteUp.current(
                block.noteEvent.pitch,
                block.noteEvent.velocity
              )
            } else {
              sessionPlayer.noteOff(
                block.noteEvent.family,
                block.noteEvent.pitch
              )
            }
          renderInfo.current.blockRail[keyName].shift()
        }
      })
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

      renderInfo.current.timer += delta

      processBlocks()
      ref.current.position.setY(-Y_LENGTH_PER_SECOND * renderInfo.current.timer)
    })

    return <group ref={ref}>{noteBlocks}</group>
  }

  return (
    <group>
      <NoteRender />
    </group>
  )
}

export default PianoRoll
