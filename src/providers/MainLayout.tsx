import {
  Box,
  Button,
  Collapse,
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
import { ReactElement, useCallback, useState } from 'react'
import Logo from '@assets/logo.svg'
import LoadingScreen from '@components/LoadingScreen'
import MuiAppBar, { AppBarProps } from '@mui/material/AppBar'
import { ExpandLess, ExpandMore } from '@mui/icons-material'

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
      displayName: 'Play with Youtube',
      link: '/youtubepractice',
    },
    {
      displayName: 'Scale',
      link: '/scale/major',
      subs: [{ displayName: 'Major', link: '/scale/major' }],
    },
    {
      displayName: 'Two-Five-One',
      link: '/twofiveone',
    },
  ])

  const [open, setOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const handleToggleDrawer = useCallback(() => {
    setOpen(!open)
  }, [open])

  const menuElement = useCallback(
    (menuItemList: MenuItem[]) => {
      return (
        <List>
          {menuItemList.map((item, index) => {
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
        <Drawer variant="permanent" open={open}>
          <DrawerHeader>
            {open && <img alt="logo" src={Logo} width="10%" />}
            <IconButton onClick={handleToggleDrawer}>
              {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          {menuElement(itemList)}
        </Drawer>
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
              // height: 60,
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
          <Box
            component="main"
            display="flex"
            flexDirection={'row'}
            justifyContent="center"
            alignItems={'center'}
            sx={{ p: 2 }}
            minHeight={`calc(100vh - 66px)`}
            minWidth={`calc(100vw - ${drawerWidth})`}
          >
            <Box sx={{ width: '100%' }}>
              <Outlet />
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </Box>
  )
}

export default MainLayout
