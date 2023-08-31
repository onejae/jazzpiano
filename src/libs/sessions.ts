import * as MIDI from 'midicube'

export {}

declare global {
  interface Window {
    MIDI: any
  }
}

window.MIDI = MIDI

const family_channel = {
  bass: 1,
  drums: 2,
}

MIDI.loadPlugin({
  // this only has piano.
  // for other sounds install the MIDI.js
  // soundfonts somewhere.
  soundfontUrl: '/demo/jukebox/soundfont/FluidR3_GM/',
  //   instrument: 'drums',
  instruments: ['drums', 'acoustic_bass'], // or multiple instruments

  onerror: (e) => {
    console.log(e)
  },
  onsuccess: () => {
    MIDI.programChange(
      family_channel['drums'],
      MIDI.GM.byName['acoustic_grand_piano'].program
    )

    MIDI.programChange(
      family_channel['bass'],
      MIDI.GM.byName['acoustic_bass'].program
    )
  },
})

class SessionPlayer {
  midiPlayer: any

  constructor() {
    this.midiPlayer = MIDI
  }

  noteOn(family: string, pitch: number, velocity: number, delay: number) {
    this.midiPlayer.noteOn(family_channel[family], pitch, velocity * 0.6, delay)
  }

  noteOff(family: string, pitch: number) {
    this.midiPlayer.noteOff(family_channel[family], pitch, 0)
  }
}

const sessionPlayer = new SessionPlayer()

export default sessionPlayer
