import { AudioDropzone } from '@components/AudioDropzone'
import PianoRoll from '@components/NoteRoll'
import { RealPiano } from '@components/RealPiano'
import { Box } from '@mui/material'
import { MidiControlProvider } from '@providers/MidiControl'
import { TransportProvider } from '@providers/TransportProvider'
import {
  getMidiFromYoutubeLink,
  getNoteEventsFromTonejs,
} from '@services/convertService'
import { useCallback, useRef, useState } from 'react'
import { NoteEvent } from 'types/midi'

import { TransportGroup } from '@components/TransportGroup'
import { TransportPanel } from '@components/TransportPanel'
import { VirtualPiano } from '@components/VirtualPiano'
import { Canvas, useFrame } from '@react-three/fiber'
import { Midi } from '@tonejs/midi'
import { MovingStars } from '@components/InfiniteBackround'

import * as THREE from 'three'
import { PlayList } from '@components/PlayList'

const touchLinePosition = new THREE.Vector3(0, -3, 0)

const Playground = () => {
  const [noteEvents, setNoteEvents] = useState<NoteEvent[] | null>(null)

  const Background = () => {
    const timeRef = useRef(0)

    useFrame(({ clock }) => {
      timeRef.current = clock.getElapsedTime()
    })
    return (
      <mesh>
        <MovingStars />
      </mesh>
    )
  }

  const handleYoutubeLink = useCallback(async (youtubeLink: string) => {
    try {
      const response = await getMidiFromYoutubeLink({ link: youtubeLink })

      if (response.note_events) {
        const noteEventsSorted = response.note_events.sort((a, b) => {
          if (a[0] > b[0]) return 1
          else if (a[0] === b[0]) return 0
          else return -1
        })

        const noteEventFiltered = noteEventsSorted.filter((v) => v[2] >= 40)

        setNoteEvents(noteEventFiltered)
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

  return (
    <Box display="flex" flexDirection={'column'}>
      <Box flexGrow={1} minHeight="100%">
        <Box
          position={'absolute'}
          paddingTop={5}
          left={['calc(50% - 120px)', 'calc(50% - 240px)']}
          width={['240px', '480px']}
          top={0}
          zIndex={9999}
        >
          <AudioDropzone
            onDrop={handleDropFile}
            onYoutubeLink={handleYoutubeLink}
          />
        </Box>
        <Box>
          <PlayList />
        </Box>
        <TransportProvider>
          <div
            style={{ width: '100%', justifyContent: 'center', display: 'flex' }}
          >
            <div
              style={{
                width: '100vw',
                height: 'calc(100vh - 100px)',
                backgroundColor: 'white',
              }}
            >
              <Canvas
                onCreated={({ gl }) => {
                  gl.localClippingEnabled = true
                }}
                camera={{
                  position: [0, 0, 15],
                  fov: 55,
                  near: 0.1,
                  far: 400,
                }}
              >
                <ambientLight position={[-3, 0, -3]} intensity={0.9} />
                <pointLight position={[-13, 10, 0]} intensity={0.9} />
                <MidiControlProvider>
                  <TransportGroup>
                    <Background />
                    <PianoRoll noteEvents={noteEvents || []} />
                    <VirtualPiano position={touchLinePosition} />
                    <RealPiano />
                  </TransportGroup>
                </MidiControlProvider>
              </Canvas>
            </div>
          </div>
          <TransportPanel />
        </TransportProvider>
      </Box>
    </Box>
  )
}

export default Playground
