import { KEY_NUM, START_MIDI_KEY } from '@constants/keys'
import { PitchIndex } from '@constants/notes'

export class KeyModel {
  midiNumber: number
  octave: number
  noteName: string
  pressed: boolean

  constructor(midiNumber: number) {
    this.midiNumber = midiNumber
    this.noteName = KeyModel.getNoteFromMidiNumber(midiNumber)
    this.octave = KeyModel.getOctaveFromMidiNumber(midiNumber)
    this.pressed = false
  }

  static getOctaveFromMidiNumber = (midiNumber: number): number => {
    return Math.floor(midiNumber / 12 - 1)
  }

  static getNoteFromMidiNumber = (midiNumber: number): string => {
    const PitchName = [
      'C',
      'C#',
      'D',
      'D#',
      'E',
      'F',
      'F#',
      'G',
      'G#',
      'A',
      'A#',
      'B',
    ]

    const octave = KeyModel.getOctaveFromMidiNumber(midiNumber)
    const index = midiNumber % 12

    return PitchName[index] + octave.toString()
  }

  getPitchIndex(): PitchIndex {
    return this.midiNumber % 12
  }

  getIndexInOctave(): number {
    return this.getPitchIndex()
  }

  isWhiteKey(): boolean {
    const pitchName = this.getPitchIndex()

    switch (pitchName) {
      case PitchIndex.A:
      case PitchIndex.B:
      case PitchIndex.C:
      case PitchIndex.D:
      case PitchIndex.E:
      case PitchIndex.F:
      case PitchIndex.G:
        return true
    }

    return false
  }
}

export const keyModels = Array.from({ length: KEY_NUM }).map(
  (_, idx) => new KeyModel(START_MIDI_KEY + idx)
)

export const keyModelsByMidi: { [midiNumber: number]: KeyModel } = {}

keyModels.forEach((keyModel) => {
  keyModelsByMidi[keyModel.midiNumber] = keyModel
})