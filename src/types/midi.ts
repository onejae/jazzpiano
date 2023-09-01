export interface ITimeEvent {
  start_s: number
  end_s: number
}
export interface NoteEvent extends ITimeEvent {
  family: string
  pitch: number
  velocity?: number
  played?: boolean
}
