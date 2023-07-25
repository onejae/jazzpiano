import { KEY_NUM, START_MIDI_KEY } from '@constants/keys'
import { KeyNameIndex, NoteName } from '@constants/notes'
import { KeyName, PitchIndex } from '@constants/notes'
import { ScaleIndexTable, ScaleName } from '@constants/scales'

export class KeyModel {
  midiNumber: number
  octave: number
  keyName: KeyName
  pressed: boolean

  constructor(midiNumber: number) {
    this.midiNumber = midiNumber
    this.keyName = KeyModel.getNoteNameFromMidiNumber(midiNumber) as KeyName
    this.octave = KeyModel.getOctaveFromMidiNumber(midiNumber)
    this.pressed = false
  }

  static getOctaveFromMidiNumber = (midiNumber: number): number => {
    return Math.floor(midiNumber / 12 - 1)
  }

  static getNoteNameFromMidiNumber = (midiNumber: number): NoteName => {
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

    const index = midiNumber % 12

    return (PitchName[index] +
      KeyModel.getOctaveFromMidiNumber(midiNumber).toString()) as NoteName
  }

  static getKeyNameFromMidiNumber = (midiNumber: number): KeyName => {
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

    const index = midiNumber % 12

    return PitchName[index] as KeyName
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

export const getMidiNumbersFromKeyScale = (
  key: KeyName,
  scale: ScaleName
): number[] => {
  const indexes = ScaleIndexTable[scale]

  const keyIndex = KeyNameIndex[key]

  // return indexes.map((index) => (index + keyIndex) % 12).sort((a, b) => a - b)
  return indexes.map((index) => (index + keyIndex) % 12)
}

export const getKeyNamesFromKeyScale = (
  key: KeyName,
  scale: ScaleName
): KeyName[] => {
  const indexes = getMidiNumbersFromKeyScale(key, scale)

  return indexes.map((index) => KeyModel.getKeyNameFromMidiNumber(index % 12))
}

keyModels.forEach((keyModel) => {
  keyModelsByMidi[keyModel.midiNumber] = keyModel
})
