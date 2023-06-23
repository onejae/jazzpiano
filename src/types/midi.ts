enum NoteEventField {
  start_s = 0,
  end_s = 1,
  pitch = 2,
  velocity = 3,
}

export interface NoteEvent {
  data: number[]
}
