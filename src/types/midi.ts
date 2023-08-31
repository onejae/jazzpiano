export interface NoteEvent {
  family: string
  start_s: number
  end_s: number
  pitch: number
  velocity?: number
  played?: boolean
}
