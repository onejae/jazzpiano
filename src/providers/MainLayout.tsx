import {
  Box,
  Button,
  Collapse,
  CssBaseline,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ThemeProvider,
  Typography,
} from '@mui/material'
import Toolbar from '@mui/material/Toolbar'
import { createTheme, styled } from '@mui/material/styles'

import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ReactElement, useCallback, useState } from 'react'
import Logo from '@assets/logo.svg'
import LoadingScreen from '@components/LoadingScreen'
import MuiAppBar, { AppBarProps } from '@mui/material/AppBar'
import { ExpandLess, ExpandMore } from '@mui/icons-material'

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
            color: '#000000',
            '& .MuiSvgIcon-root': {
              color: 'rgba(0, 0, 0, 0.54)',
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
    MuiListItem: {
      styleOverrides: {
        root: {
          marginLeft: 20,
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
  zIndex: theme.zIndex.drawer + -1,
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

interface MenuItem {
  displayName: string
  link: string
  icon?: ReactElement
  subs?: MenuItem[]
  open?: boolean
}

const MainLayout = () => {
  const [itemList, setItmeList] = useState<MenuItem[]>([
    {
      displayName: 'Playground',
      link: '/playground',
    },
    {
      displayName: 'Game',
      link: '/game',
    },
    {
      displayName: 'Scale',
      link: '/scale/major',
      subs: [{ displayName: 'Major', link: '/scale/major' }],
    },
  ])

  const [open] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const menuElement = useCallback(
    (menuItemList: MenuItem[]) => {
      return (
        <List sx={{ display: 'flex' }}>
          {menuItemList.map((item, index) => {
            return (
              <ListItem key={index} disablePadding>
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
                  {item.icon && (
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={item.displayName}
                    sx={{ opacity: open ? 1 : 0 }}
                  />

                  {item.subs && (
                    <>
                      <ListItemButton
                        onClick={() => {
                          item.open = !item.open

                          setItmeList([...itemList])
                        }}
                      >
                        {item.open ? <ExpandLess /> : <ExpandMore />}
                      </ListItemButton>
                    </>
                  )}
                </ListItemButton>

                {item.subs && (
                  <Collapse in={item.open} timeout="auto" unmountOnExit>
                    {menuElement(item.subs)}
                  </Collapse>
                )}
              </ListItem>
            )
          })}
        </List>
      )
    },
    [itemList, location.pathname, navigate, open]
  )
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <ThemeProvider theme={theme}>
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
          }}
        >
          <AppBar
            sx={{
              width: '100%',
              borderRadius: 0,
              borderBottom: 'solid 1px #EAEAEA',
              maxHeight: 60,
            }}
            position="sticky"
            elevation={0}
            open={open}
          >
            <Toolbar>
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="flex-start"
                flexGrow={1}
              >
                <Typography variant="h6" component="div">
                  Jazz Piano Practice Portal
                </Typography>

                <img alt="logo" src={Logo} width={50} />
              </Box>

              <Box sx={{ display: 'flex' }}>
                {menuElement(itemList)}
                <Button sx={{ minWidth: 100 }}>Sign in</Button>
              </Box>
            </Toolbar>
            <LoadingScreen loading={false} />
          </AppBar>
          <Box
            component="main"
            display="flex"
            flexDirection={'row'}
            justifyContent="center"
            alignItems={'center'}
            minHeight={`calc(100vh - 60px)`}
            minWidth={`calc(100vw - ${drawerWidth})`}
          >
            <Box
              sx={{
                width: '100%',
                height: 'calc(100vh - 100px)',
              }}
            >
              <Outlet />
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </Box>
  )
}

export default MainLayout
