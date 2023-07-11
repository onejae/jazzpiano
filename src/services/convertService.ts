import { KEY_NUM, START_MIDI_KEY } from '@constants/keys'
import { EXCLUDE_INSTRUMENT_FAMILIES } from '@constants/midi'
import { Midi, Track } from '@tonejs/midi'
import { Note } from '@tonejs/midi/dist/Note'
import axios, { AxiosResponse } from 'axios'
import { NoteEvent } from 'types/midi'

export interface IYoutubeConvert {
  link: string
}

export interface IMidiConvertResponse {
  note_events: NoteEvent[]
}

export const getMidiFromYoutubeLink = async (
  request: IYoutubeConvert
): Promise<IMidiConvertResponse> => {
  const response: AxiosResponse<any> = await axios.get<{
    data: IMidiConvertResponse
  }>('/convert/youtube/midi/', { params: request })

  const { data } = response

  return data.data
}

export const getNoteEventsFromTonejs = (midi: Midi): NoteEvent[] => {
  const noteEvents: NoteEvent[] = []

  midi.tracks.forEach((t: Track) => {
    if (!EXCLUDE_INSTRUMENT_FAMILIES.includes(t.instrument.family)) {
      t.notes.forEach((note: Note) => {
        if (
          note.midi >= START_MIDI_KEY &&
          note.midi <= START_MIDI_KEY + KEY_NUM - 1
        )
          noteEvents.push([
            note.time,
            note.time + note.duration,
            note.midi,
            note.velocity * 127,
            false,
          ])
      })
    }
  })

  const noteEventsSorted = noteEvents.sort((a, b) => {
    if (a[0] > b[0]) return 1
    else if (a[0] === b[0]) return 0
    else return -1
  })

  return noteEventsSorted
}
