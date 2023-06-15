import { useState } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './App.css'
import MainLayout from './providers/MainLayout'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
  },
])

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
