import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import MainLayout from '@providers/MainLayout'
import TwoFiveOne from '@pages/TwoFiveOne'
import MajorScale from '@pages/Scale'
import Playground from '@pages/Playground'
import axios from 'axios'
import ImprovisationGame from '@pages/ImprovisationGame'
import { MidiControlProvider } from '@providers/MidiControl'
import { GameControlProvider } from '@providers/GameControlProvider'

const baseURL = import.meta.env.VITE_API_URL

axios.defaults.baseURL = baseURL

const wrapWithMidiControl = (el) => (
  <MidiControlProvider>{el}</MidiControlProvider>
)

const wrapWithGameControl = (el) => (
  <GameControlProvider>{el}</GameControlProvider>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: 'twofiveone',
        element: <TwoFiveOne />,
      },
      {
        path: 'playground',
        element: <Playground />,
      },
      {
        path: 'game',
        element: wrapWithGameControl(
          wrapWithMidiControl(<ImprovisationGame />)
        ),
      },
      {
        path: 'scale',
        children: [
          {
            index: true,
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
