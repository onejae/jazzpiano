import { Box, Button, TextField } from '@mui/material'
import { useCallback, useState } from 'react'
import Dropzone from 'react-dropzone'

import { isMobile } from 'react-device-detect'

export const useAudioDropzone = () => {
  const [youtubeLink, setYoutubeLink] = useState('')

  return { youtubeLink, setYoutubeLink }
}

const enableYoutube = false

export const AudioDropzone = (audioProps: {
  onYoutubeLink: any
  onDrop: any
}) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      audioProps.onDrop(acceptedFiles)
    },
    [audioProps]
  )

  const { youtubeLink, setYoutubeLink } = useAudioDropzone()

  return (
    <Box
      color={['red', 'white']}
      border={1}
      bgcolor={['#83234266', 'transparent']}
      sx={{ borderStyle: 'dashed' }}
      display="flex"
      justifyContent={'center'}
      alignItems="center"
      width={'100%'}
    >
      <Dropzone accept={{ 'audio/midi': ['.mid'] }} onDrop={onDrop}>
        {({ getRootProps, getInputProps }) => {
          const props = getRootProps()
          props.style = {
            ...props.style,
            minWidth: '100%',
            width: '100%',
          }
          return (
            <div {...props}>
              <input {...getInputProps()} />
              <p style={{ textAlign: 'center' }}>
                {isMobile
                  ? 'midi file'
                  : "Drag 'n' drop midi file here, or click to select file"}
              </p>

              {enableYoutube && (
                <>
                  <p style={{ textAlign: 'center', marginBottom: 0 }}>or </p>
                  <Box
                    display="flex"
                    justifyContent={'center'}
                    paddingBottom={1}
                  >
                    <TextField
                      sx={{ minWidth: 380 }}
                      id="standard-basic"
                      label="Youtube link"
                      value={youtubeLink}
                      variant="standard"
                      onChange={(e) => {
                        setYoutubeLink(e.target.value)
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                      }}
                      InputProps={{
                        endAdornment: (
                          <Button
                            onClick={() =>
                              audioProps.onYoutubeLink(youtubeLink)
                            }
                          >
                            Process
                          </Button>
                        ),
                      }}
                    />
                  </Box>
                </>
              )}
            </div>
          )
        }}
      </Dropzone>
    </Box>
  )
}
