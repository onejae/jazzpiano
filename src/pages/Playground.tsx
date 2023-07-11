import { Box } from '@mui/material'
import { useCallback, useState } from 'react'
import {
  getMidiFromYoutubeLink,
  getNoteEventsFromTonejs,
} from '@services/convertService'
import { NoteEvent } from 'types/midi'
import PianoRoll from '@components/NoteRoll'
import { MidiControlProvider } from '@providers/MidiControl'
import { TransportProvider, useTransport } from '@providers/TransportProvider'
import { RealPiano } from '@components/RealPiano'
import { AudioDropzone } from '@components/AudioDropzone'

import { Midi } from '@tonejs/midi'
import { Canvas } from '@react-three/fiber'
import { TransportPanel } from '@components/TransportPanel'
import { VirtualPiano } from '@components/VirtualPiano'
import { DEFAULT_ANGLE } from '@constants/view'

type ROLLSTATE = 'INIT' | 'PLAYING'

const Playground = () => {
  const [noteEvents, setNoteEvents] = useState<NoteEvent[] | null>(null)
  const [_rollState, setRollState] = useState<ROLLSTATE>('INIT')
  const handleYoutubeLink = useCallback(async (youtubeLink: string) => {
    try {
      const response = await getMidiFromYoutubeLink({ link: youtubeLink })

      if (response.note_events) {
        // just for debugging
        const noteEventsSorted = response.note_events.sort((a, b) => {
          if (a[0] > b[0]) return 1
          else if (a[0] === b[0]) return 0
          else return -1
        })

        const noteEventFiltered = noteEventsSorted.filter((v) => v[2] >= 40)

        setNoteEvents(noteEventFiltered)
        setRollState('PLAYING')
      }
    } catch (error) {
      alert(error)
    }
  }, [])

  const handleDropFile = useCallback((files: any[]) => {
    const reader = new FileReader()
    reader.onload = function (e) {
      const buf = e.target.result as ArrayBuffer

      const midi = new Midi(buf)

      const noteEvents = getNoteEventsFromTonejs(midi)

      setNoteEvents(noteEvents)
    }
    if (files.length > 0) reader.readAsArrayBuffer(files[0])
  }, [])

  const [angle, setAngle] = useState(DEFAULT_ANGLE)

  return (
    <Box display="flex" flexDirection={'column'}>
      <Box flexGrow={1}>
        <AudioDropzone
          onDrop={handleDropFile}
          onYoutubeLink={handleYoutubeLink}
        />
        <TransportProvider>
          <div
            style={{ width: '100%', justifyContent: 'center', display: 'flex' }}
          >
            <div
              style={{
                width: '100vw',
                height: 'calc(60vh)',
                backgroundColor: 'white',
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
                <ambientLight position={[2, 0, 0]} intensity={0.3} />
                <pointLight position={[-3, 0, 0]} intensity={3.3} />
                <MidiControlProvider>
                  <group
                    scale={[1, 1, 1]}
                    rotation={[angle, 0, 0]}
                    position={[0, -3.5, 0]}
                  >
                    <PianoRoll noteEvents={noteEvents || []} />
                    <VirtualPiano />
                    <RealPiano />
                  </group>
                </MidiControlProvider>
              </Canvas>
            </div>
          </div>
          <TransportPanel onAngleChange={(angle) => setAngle(angle)} />
        </TransportProvider>
      </Box>
    </Box>
  )
}

export default Playground
