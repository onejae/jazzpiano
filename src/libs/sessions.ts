import * as MIDI from 'midicube'
import { ITimeEvent } from 'types/midi'

export {}

declare global {
  interface Window {
    MIDI: any
  }
}

window.MIDI = MIDI

const family_channel = {
  piano: 0,
  bass: 1,
  drums: 2,
}

MIDI.loadPlugin({
  soundfontUrl: '/demo/jukebox/soundfont/FluidR3_GM/',
  instruments: ['drums', 'acoustic_bass', 'bright_acoustic_piano'], // or multiple instruments

  onerror: (e) => {
    console.log(e)
  },
  onsuccess: () => {
    MIDI.programChange(
      family_channel['piano'],
      MIDI.GM.byName['bright_acoustic_piano'].program
    )

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
    this.midiPlayer.noteOn(
      family_channel[family],
      pitch,
      velocity * (family === 'piano' ? 1 : 0.6),
      delay
    )
  }

  noteOff(family: string, pitch: number, delay: number) {
    this.midiPlayer.noteOff(family_channel[family], pitch, delay)
  }
}

const sessionPlayer = new SessionPlayer()

export default sessionPlayer

export class TimeTracker {
  notes: ITimeEvent[]
  cursor: number

  constructor(notes: ITimeEvent[]) {
    this.cursor = 0
    this.notes = notes
  }

  getNotesByTime(time: number): ITimeEvent[] {
    const notes = []

    while (this.cursor < this.notes.length) {
      const candidate = this.notes[this.cursor]

      if (candidate.start_s <= time) {
        if (candidate.end_s >= time) notes.push(candidate)
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
