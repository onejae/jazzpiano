import * as THREE from 'three'
import { NoteEvent } from 'types/midi'

import { useFrame } from '@react-three/fiber'

import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react'

import { KeyRenderSpace, VirtualPiano } from '@components/VirtualPiano'
import { useMidiControl } from '../providers/MidiControl'
import { useTransport } from '@providers/TransportProvider'
import { keyModels } from '@libs/midiControl'

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

const PianoRoll = (props: PianoRollProps) => {
  const ref = useRef<THREE.Group>(null!)
  const refNoteBlocks = useRef({})
  const refRailMaterials = useRef({})
  const {
    setHandleMidiNoteDown,
    setHandleMidiNoteUp,
    refHandlePreviewNoteDown,
    refHandlePreviewNoteUp,
  } = useMidiControl()
  const { playingState, playingMode } = useTransport()

  const renderInfo = useRef<RenderInfo>({
    timer: 0,
    indexFrom: 0,
    blockRail: {},
    status: 'INIT',
    pressedMidiKeys: [],
  })

  const scoreUserTouch = (block: Block, timing: number) => {
    const timingGap = Math.abs(block.noteEvent[0] - timing)
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
      if (block.noteEvent[0] <= renderInfo.current.timer) {
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
  }, [props.noteEvents])

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
    generateBlockRail()
    if (props.noteEvents.length) renderInfo.current.status = 'LOADED'
  }, [generateBlockRail, props.noteEvents])

  useEffect(() => {
    if (playingState === 'stopped') {
      generateBlockRail()
      renderInfo.current.timer = 0
    }
  }, [generateBlockRail, playingState])

  const Background = () => {
    const lanes = []

    useFrame((_state, _delta) => {
      // color the rail
      renderInfo.current.pressedMidiKeys.forEach((v) => {
        refRailMaterials.current[v].color.set(0xff0000)
      })
      // end of coloring
    })

    keyModels.forEach((v, idx) => {
      const renderSpace = KeyRenderSpace[v.midiNumber]

      const geometry = new THREE.BoxGeometry(renderSpace.w, 100, renderSpace.d)
      const lineGeometry = new THREE.EdgesGeometry(geometry)

      lanes.push(
        <mesh
          key={idx}
          position={[renderSpace.x, 0, renderSpace.z - 0.01]}
          frustumCulled
        >
          <boxGeometry args={[renderSpace.w, 100, renderSpace.d]} />
          <lineSegments args={[lineGeometry]}>
            <lineBasicMaterial
              color={0x000000}
              clippingPlanes={[
                new THREE.Plane(new THREE.Vector3(0, 1, -1), 1.73),
              ]}
            />
          </lineSegments>
          <meshStandardMaterial
            clippingPlanes={[
              new THREE.Plane(new THREE.Vector3(0, 1, -1), 1.73),
            ]}
            // side={THREE.FrontSide}
            color={0xff0000}
            ref={(ref) => (refRailMaterials.current[v.midiNumber] = ref)}
          />
        </mesh>
      )
    })

    return <group>{lanes}</group>
  }

  const NoteRender = () => {
    const keyNames = Object.keys(renderInfo.current.blockRail)
    const processBlocks = () => {
      keyNames.forEach((keyName) => {
        if (renderInfo.current.blockRail[keyName].length === 0) return

        const block = renderInfo.current.blockRail[keyName][0]

        if (block.noteEvent[0] <= renderInfo.current.timer) {
          refNoteBlocks.current[block.idx].color.set(0xff0000)

          if (!block.noteEvent[4]) {
            if (refHandlePreviewNoteDown.current && playingMode === 'preview')
              refHandlePreviewNoteDown.current(
                block.noteEvent[2],
                block.noteEvent[3]
              )
            block.noteEvent[4] = true
          }
        }

        if (block.noteEvent[1] <= renderInfo.current.timer) {
          if (refHandlePreviewNoteUp.current && playingMode === 'preview')
            refHandlePreviewNoteUp.current(
              block.noteEvent[2],
              block.noteEvent[3]
            )
          renderInfo.current.blockRail[keyName].shift()
        }
      })
    }

    const getNotesToWait = (): NoteEvent[] => {
      const notesToWait: NoteEvent[] = []
      keyNames.forEach((keyName) => {
        if (renderInfo.current.blockRail[keyName].length === 0) return

        const block = renderInfo.current.blockRail[keyName][0]
        if (block.noteEvent[0] <= renderInfo.current.timer) {
          notesToWait.push(block.noteEvent)
        }
      })
      return notesToWait
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

      if (playingMode === 'step') {
        const notesToWait: NoteEvent[] = getNotesToWait()
        if (notesToWait.length === 0) {
          renderInfo.current.timer += delta
        }
      } else {
        renderInfo.current.timer += delta
      }

      processBlocks()
      ref.current.position.setY(-Y_LENGTH_PER_SECOND * renderInfo.current.timer)
    })

    return <group ref={ref}>{noteBlocks}</group>
  }

  return (
    <Suspense>
      <Background />
      <NoteRender />
    </Suspense>
  )
}

export default PianoRoll
