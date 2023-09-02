import { AudioDropzone } from '@components/AudioDropzone'
import PianoRoll from '@components/NoteRoll'
import { RealPiano } from '@components/RealPiano'
import { Box, Button } from '@mui/material'
import { MidiControlProvider } from '@providers/MidiControl'
import { useTransport } from '@providers/TransportProvider'
import { getNoteEventsFromTonejs } from '@services/convertService'
import { useCallback, useEffect, useRef, useState } from 'react'
import { NoteEvent } from 'types/midi'

import { MovingStars } from '@components/InfiniteBackround'
import { TransportGroup } from '@components/TransportGroup'
import { VirtualPiano } from '@components/VirtualPiano'
import { Canvas, useFrame } from '@react-three/fiber'
import { Midi } from '@tonejs/midi'

import { PlayItem, PlayList } from '@components/PlayList'
import * as THREE from 'three'

import LoadingScreen from '@components/LoadingScreen'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'

import sessionPlayer, { TimeTracker } from '@libs/sessions'
import { g_RenderState } from 'global'

import { useQuery } from 'react-query'

const touchLinePosition = new THREE.Vector3(0, -3, 0)

const SmallTransportPanel = () => {
  const { playingState, setPlayingState } = useTransport()
  const handlePlayButton = useCallback(() => {
    setPlayingState((current) => (current === 'playing' ? 'paused' : 'playing'))
  }, [setPlayingState])
  const handleKeyDown = useCallback(
    (ev: KeyboardEvent) => {
      if (ev.code === 'Space') {
        ev.preventDefault()
        ev.stopPropagation()
        handlePlayButton()
      }
    },
    [handlePlayButton]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  const style = {
    fontSize: 120,
    stroke: '#55555555',
    strokeWidth: 0.1,
    color: 'white',
  }

  return (
    <Box sx={{ backgroundColor: 'transparent', display: 'flex' }}>
      <Box flexGrow={1}>
        <Button onClick={handlePlayButton} sx={{ width: 200, height: 200 }}>
          {playingState === 'playing' ? (
            <PauseIcon sx={{ ...style, color: '#ffffff33' }} />
          ) : (
            <PlayArrowIcon sx={style} />
          )}
        </Button>
      </Box>
    </Box>
  )
}

const playItems = [
  {
    title: 'I thought about you',
    artist: 'Miles davis',
    avatarPath: '/avatar/miles.jpeg',
    midiPath: '/midi_files/ithoughaboutyou.mid',
  },
  {
    title: 'All the things you are',
    artist: 'Bill evans',
    avatarPath: '/avatar/bill.jpeg',
    midiPath: '/midi_files/Allthethingsyouare.mid',
  },
  {
    title: 'Prelude',
    artist: 'Debussy',
    avatarPath: '/avatar/debussy.jpeg',
    midiPath: '/midi_files/deb_prel.mid',
  },
  {
    title: 'Sonata No. 14 C# minor (Moonlight) , Opus 27/2 (1801)',
    artist: 'Beethoven',
    avatarPath: '/avatar/beethoven.jpeg',
    midiPath: '/midi_files/mond_2_format0.mid',
  },
]

const Jukebox = () => {
  const [noteEvents, setNoteEvents] = useState<NoteEvent[] | null>(null)
  const { playingState, setPlayingState } = useTransport()

  const refSessionTracker = useRef<TimeTracker>(null)
  const requestRef = useRef<number>(0)

  const [loading, setLoading] = useState<'INIT' | 'LOADING' | 'DONE'>('INIT')

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

  const handleDropFile = useCallback(
    (files: any[]) => {
      const reader = new FileReader()
      reader.onload = function (e) {
        const buf = e.target.result as ArrayBuffer

        const midi = new Midi(buf)

        const noteEvents = getNoteEventsFromTonejs(midi)

        setNoteEvents(noteEvents)
        setPlayingState('stopped')
      }
      if (files.length > 0) reader.readAsArrayBuffer(files[0])
    },
    [setPlayingState]
  )

  const initTimer = () => {
    g_RenderState.start = null
    g_RenderState.timer = 0
  }

  useQuery('TMP', () => {
    if (loading === 'INIT') handleItemSelect(playItems[0])
  })

  const handleItemSelect = useCallback(
    (item: PlayItem) => {
      initTimer()

      setLoading('LOADING')
      fetch('/demo/jukebox/' + item.midiPath).then(async (response) => {
        if (response.ok) {
          const midi = new Midi(await response.arrayBuffer())

          const noteEvents = getNoteEventsFromTonejs(midi)

          setNoteEvents(noteEvents)
          setPlayingState('stopped')
          setLoading('DONE')
        }
      })
    },

    [setPlayingState]
  )

  const processSession = useCallback(
    (t: DOMHighResTimeStamp) => {
      const current = t / 1000
      if (g_RenderState.start === null) {
        g_RenderState.start = current
        g_RenderState.last = current
      }

      if (playingState === 'playing') {
        g_RenderState.timer += current - g_RenderState.last
        const sessionNotes = refSessionTracker.current.getNotesByTime(
          g_RenderState.timer
        )
        sessionNotes.forEach((note: NoteEvent) => {
          sessionPlayer.noteOn(note.family, note.pitch, note.velocity, 0)
          sessionPlayer.noteOff(
            note.family,
            note.pitch,
            note.end_s - note.start_s
          )
        })
      }

      g_RenderState.last = current
      requestRef.current = requestAnimationFrame(processSession)
    },
    [playingState]
  )

  useEffect(() => {
    if (playingState === 'playing' || playingState === 'paused') {
      requestRef.current = requestAnimationFrame(processSession)
    } else {
      if (playingState === 'stopped') {
        initTimer()
        cancelAnimationFrame(requestRef.current)
      }
    }

    return () => cancelAnimationFrame(requestRef.current)
  }, [playingState, processSession])

  useEffect(() => {
    refSessionTracker.current = new TimeTracker(noteEvents)
  }, [noteEvents])

  return (
    <Box display="flex" flexDirection={'column'} padding={0}>
      <Box flexGrow={1} minHeight="100%" padding={0}>
        <Box
          position={'absolute'}
          paddingTop={5}
          left={['calc(100% - 100px)', 'calc(50% - 240px)']}
          width={['60px', '480px']}
          top={['calc(100% - 120px)', 0]}
          zIndex={9999}
        >
          <AudioDropzone onDrop={handleDropFile} />
        </Box>
        <Box
          position={'absolute'}
          zIndex={9999}
          sx={{ background: 'transparent' }}
        >
          <PlayList playItems={playItems} onSelect={handleItemSelect} />
        </Box>
        <div
          style={{
            width: '100%',
            justifyContent: 'center',
            display: 'flex',
          }}
        >
          <div
            style={{
              width: '100vw',
              height: '100vh',
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
                  <group position={touchLinePosition}>
                    <PianoRoll noteEvents={noteEvents || []} />
                    <VirtualPiano />
                  </group>
                  <RealPiano />
                </TransportGroup>
              </MidiControlProvider>
            </Canvas>
          </div>

          {loading === 'DONE' && (
            <Box
              position="absolute"
              zIndex={9999}
              top={'calc(50vh - 120px)'}
              bottom={'25%'}
            >
              <SmallTransportPanel />
            </Box>
          )}
        </div>
      </Box>
      <LoadingScreen loading={loading === 'LOADING'} />
    </Box>
  )
}

export default Jukebox
