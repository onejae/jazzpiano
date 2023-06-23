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
