import {
  Avatar,
  Box,
  Divider,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material'
import React, { useState } from 'react'

export interface PlayItem {
  title: string
  artist: string
  avatarPath: string
  midiPath: string
}

interface PlayListProps {
  playItems: PlayItem[]
  onSelect: SelectEventHandler
}

type SelectEventHandler = (item: PlayItem) => void

export const PlayList = ({ playItems = [], onSelect }: PlayListProps) => {
  const theme = createTheme({
    components: {
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor: '#FF000088',
            },
          },
        },
      },
    },
  })

  const [selectedIdx, setSelectIdx] = useState(0)
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ background: 'transparent' }}>
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'transparent' }}>
          {playItems.map((item, idx) => (
            <div key={idx}>
              <ListItemButton
                key={idx}
                alignItems="flex-start"
                selected={idx === selectedIdx}
                onClick={() => {
                  setSelectIdx(idx)
                  onSelect(item)
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    alt="Remy Sharp"
                    src={'/demo/jukebox' + item.avatarPath}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography color="white">{item.title}</Typography>}
                  secondary={
                    <React.Fragment>
                      <Typography
                        sx={{ display: 'inline' }}
                        component="span"
                        variant="body2"
                        color="grey"
                      >
                        {item.artist}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItemButton>
              <Divider variant="inset" component="li" />
            </div>
          ))}
        </List>
      </Box>
    </ThemeProvider>
  )
}
