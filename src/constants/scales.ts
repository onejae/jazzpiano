type ScaleName =
  | 'major'
  | 'minor'
  | 'ionian'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'aeolian'
  | 'locrian'

export const ScaleIndexTable: { [scaleName in ScaleName]: number[] } = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 9, 11],
  ionian: [0, 2, 4, 5],
  dorian: [0, 2, 4, 5],
  phrygian: [0, 2, 4, 5],
  lydian: [0, 2, 4, 5],
  mixolydian: [0, 2, 4, 5],
  aeolian: [0, 2, 4, 5],
  locrian: [0, 2, 4, 5],
}
