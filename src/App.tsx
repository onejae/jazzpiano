import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './App.css'
import MainLayout from './providers/MainLayout'
import TwoFiveOne from '@pages/TwoFiveOne'
import MajorScale from '@pages/Scale'
import YoutubePractice from '@pages/YoutubePractice'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        path: 'twofiveone',
        element: <TwoFiveOne />,
      },

      {
        index: true,
        path: 'youtubepractice',
        element: <YoutubePractice />,
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
