import {
  Box,
  Button,
  CssBaseline,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ThemeProvider,
  Typography,
} from '@mui/material'
import Toolbar from '@mui/material/Toolbar'
import { createTheme, styled, Theme, CSSObject } from '@mui/material/styles'
import MuiDrawer from '@mui/material/Drawer'

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import React, { useCallback, useMemo, useState } from 'react'
import Logo from '@assets/logo.svg'
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard'
import LoadingScreen from '@components/LoadingScreen'
import MuiAppBar, { AppBarProps } from '@mui/material/AppBar'

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
})

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
})

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}))

const theme = createTheme({
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'white',
          color: '#6c757d',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'white',
          color: '#8391a2',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#FFFFFF',
            '& .MuiSvgIcon-root': {
              color: '#FFFFFF',
            },
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontSize: 13,
        },
      },
    },
  },
})

const drawerWidth = 200

interface CustomAppBarProps extends AppBarProps {
  open?: boolean
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<CustomAppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}))

const MainLayout = () => {
  const itemList = useMemo(() => {
    return [{ label: 'Dashboard', icon: <SpaceDashboardIcon />, link: '/' }]
  }, [])

  const [open, setOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const handleToggleDrawer = useCallback(() => {
    setOpen(!open)
  }, [open])

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <ThemeProvider theme={theme}>
        <Drawer variant="permanent" open={open}>
          <DrawerHeader>
            {open && <img alt="logo" src={Logo} width="10%" />}
            <IconButton onClick={handleToggleDrawer}>
              {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            {itemList.map((item, index) => {
              return (
                <ListItem key={index} disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                    }}
                    onClick={() => {
                      navigate(item.link)
                    }}
                    selected={
                      item.link ===
                      (location.pathname === '/'
                        ? '/medicalrecord'
                        : location.pathname)
                    }
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      sx={{ opacity: open ? 1 : 0 }}
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
          <Divider />
        </Drawer>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <AppBar
            sx={{
              width: '100%',
              borderRadius: 0,
              borderBottom: 'solid 1px #EAEAEA',
            }}
            position="sticky"
            elevation={0}
            open={open}
          >
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Jazz Piano Practice Portal
              </Typography>
              <Button>Sign in</Button>
            </Toolbar>
          </AppBar>
          <LoadingScreen />
          <Box component="main" sx={{ p: 2 }}>
            <Outlet />
          </Box>
        </Box>
      </ThemeProvider>
    </Box>
  )
}

export default MainLayout
