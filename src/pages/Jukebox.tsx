import { AudioDropzone } from '@components/AudioDropzone'
import PianoRoll from '@components/NoteRoll'
import { RealPiano } from '@components/RealPiano'
import { Box, Button } from '@mui/material'
import { MidiControlProvider } from '@providers/MidiControl'
import { useTransport } from '@providers/TransportProvider'
import {
  getMidiFromYoutubeLink,
  getNoteEventsFromTonejs,
} from '@services/convertService'
import { useCallback, useEffect, useRef, useState } from 'react'
import { NoteEvent } from 'types/midi'

import { TransportGroup } from '@components/TransportGroup'
import { VirtualPiano } from '@components/VirtualPiano'
import { Canvas, useFrame } from '@react-three/fiber'
import { Midi } from '@tonejs/midi'
import { MovingStars } from '@components/InfiniteBackround'

import * as THREE from 'three'
import { PlayItem, PlayList } from '@components/PlayList'

import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import axios from 'axios'
import LoadingScreen from '@components/LoadingScreen'

const touchLinePosition = new THREE.Vector3(0, -3, 0)

import * as MIDI from 'midicube'

window.MIDI = MIDI // Register to global first

// MIDI.loadPlugin({
//   // this only has piano.
//   // for other sounds install the MIDI.js
//   // soundfonts somewhere.
//   soundfontUrl: '/soundfont/',
//   onerror: console.warn,
//   onsuccess: () => {
//     // MIDI.noteOn(0, 60, 1)
//     // MIDI.noteOn(1, 60, 80)
//     // MIDI.noteOn(2, 60, 80)
//     // MIDI.noteOn(3, 60, 80)
//   },
// })

// MIDI.loadPlugin({
//   soundfontUrl: '/demo/jukebox/soundfont/FluidR3_GM/',
//   // soundfontUrl: 'http://gleitz.github.io/midi-js-soundfonts/',
//   // instrument: 'acoustic_grand_piano', // or the instrument code 1 (aka the default)
//   instruments: ['acoustic_grand_piano', 'drums'], // or multiple instruments
//   onsuccess: function () {
//     debugger
//     MIDI.programChange(0, MIDI.GM.byName['steel_drums'].program)
//     // MIDI.programChange(8, MIDI.GM.byName['acoustic_grand_piano'].program)
//   },
// })

const Player = new MIDI.Player()

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
    title: 'Prelude',
    artist: 'Debussy',
    avatarPath: '/avatar/debussy.jpeg',
    midiPath: '/midi_files/deb_prel.mid',
  },
  {
    title: 'All the things you are',
    artist: 'Bill evans',
    avatarPath: '/avatar/bill.jpeg',
    midiPath: '/midi_files/Allthethingsyouare.mid',
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
  const { setPlayingState } = useTransport()
  const [playingItem, setPlayingItem] = useState(null)

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

  const handleItemSelect = useCallback(
    (item: PlayItem) => {
      if (playingItem && item.midiPath === playingItem.midiPath) {
        return
      }

      // Player.loadFile(
      //   'http://localhost:5173/demo/jukebox' + item.midiPath,
      //   () => {
      //     debugger
      //     Player.start()
      //   }
      // )

      axios
        .get('/demo/jukebox' + item.midiPath, {
          responseType: 'arraybuffer', // Set the responseType to 'arraybuffer'
        })
        .then((e) => {
          Player.currentTime = 0
          Player.playing = true
          Player.endTime = 100

          Player.addListener(function (data) {
            // set it to your own function!
            const now = data.now // where we are now
            const end = data.end // time when song ends
            const channel = data.channel // channel note is playing on
            const message = data.message // 128 is noteOff, 144 is noteOn
            const note = data.note // the note
            const velocity = data.velocity // the velocity of the note
            // then do whatever you want with the information!
          })

          const uint8Array = new Uint8Array(e.data)

          // Convert the Uint8Array to a string
          let binaryString = ''
          for (let i = 0; i < uint8Array.length; i++) {
            binaryString += String.fromCharCode(uint8Array[i])
          }

          // Encode the binary string to Base64 using btoa
          const base64String = 'data:audio/midi;base64,' + btoa(binaryString)

          // Player.loadFile(base64String, () => {})
          // Player.start()

          const midi = new Midi(e.data)

          const noteEvents = getNoteEventsFromTonejs(midi)

          setNoteEvents(noteEvents)
          setPlayingState('stopped')
        })

      setPlayingItem(item)
    },
    [playingItem, setPlayingState]
  )

  useEffect(() => {
    if (!noteEvents) {
      handleItemSelect(playItems[0])
    }
  }, [handleItemSelect, noteEvents])

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
          <AudioDropzone
            onDrop={handleDropFile}
            onYoutubeLink={handleYoutubeLink}
          />
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

          <Box
            position="absolute"
            zIndex={9999}
            top={'calc(50vh - 120px)'}
            bottom={'25%'}
          >
            <SmallTransportPanel />
          </Box>
        </div>
      </Box>
      <LoadingScreen />
    </Box>
  )
}

export default Jukebox
