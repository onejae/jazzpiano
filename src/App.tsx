import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import MainLayout from '@providers/MainLayout'
import TwoFiveOne from '@pages/TwoFiveOne'
import MajorScale from '@pages/Scale'
import YoutubePractice from '@pages/YoutubePractice'
import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL

axios.defaults.baseURL = baseURL

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
