import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import MainLayout from '@providers/MainLayout'
import TwoFiveOne from '@pages/TwoFiveOne'
import MajorScale from '@pages/Scale'
import Playground from '@pages/Playground'
import axios from 'axios'
import ImprovisationGame from '@pages/ImprovisationGame'
import { MidiControlProvider } from '@providers/MidiControl'
import { GameControlProvider } from '@providers/GameControlProvider'
import { RealPiano } from '@components/RealPiano'
import { GameScoreProvider } from '@providers/GameScoreProvider'

const baseURL = import.meta.env.VITE_API_URL

axios.defaults.baseURL = baseURL
axios.defaults.headers.common['Authorization'] =
  'Bearer ' + import.meta.env.VITE_API_KEY
axios.defaults.withCredentials = true

const wrapWithMidiControl = (el) => (
  <MidiControlProvider>
    {el}
    <RealPiano />
  </MidiControlProvider>
)

const wrapWithGameControl = (el) => (
  <GameControlProvider>{el}</GameControlProvider>
)

const wrapWithScoreProvider = (el) => (
  <GameScoreProvider>{el}</GameScoreProvider>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/game" replace /> },
      {
        path: 'game',
        element: wrapWithGameControl(
          wrapWithScoreProvider(wrapWithMidiControl(<ImprovisationGame />))
        ),
      },
      {
        path: 'twofiveone',
        element: <TwoFiveOne />,
      },
      {
        path: 'playground',
        element: <Playground />,
      },
      {
        path: 'scale',
        children: [
          {
            path: 'major',
            element: <MajorScale />,
          },
        ],
      },
    ],
  },
])

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
