import {
  Avatar,
  Box,
  Divider,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material'
import React from 'react'

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
  return (
    <Box sx={{ background: 'transparent' }}>
      <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'transparent' }}>
        {playItems.map((item) => (
          <>
            <ListItemButton
              alignItems="flex-start"
              onClick={() => onSelect(item)}
            >
              <ListItemAvatar>
                <Avatar alt="Remy Sharp" src={item.avatarPath} />
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
          </>
        ))}
      </List>
    </Box>
  )
}
