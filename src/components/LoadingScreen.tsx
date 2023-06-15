import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
} from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

enum LoadingState {
  INIT = 0,
  LOADING = 1,
  DONE = 2,
}

enum SpinningType {
  LOCK = 0,
  NOLOCK = 1,
}

const LoadingScreen = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.INIT
  )

  const [spinningType, setSpinningType] = useState<SpinningType>(
    SpinningType.NOLOCK
  )

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use((config) => {
      setSpinningType(
        ['post', 'put'].includes(config.method || 'get')
          ? SpinningType.LOCK
          : SpinningType.NOLOCK
      )
      setLoadingState(LoadingState.LOADING)
      return config
    })

    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        setLoadingState(LoadingState.DONE)
        return response
      },
      (error) => {
        setLoadingState(LoadingState.INIT)
        return Promise.reject(error)
      }
    )

    return () => {
      axios.interceptors.request.eject(requestInterceptor)
      axios.interceptors.response.eject(responseInterceptor)
    }
  }, [])

  return (
    <>
      {loadingState === LoadingState.LOADING &&
        spinningType === SpinningType.LOCK && (
          <Box
            sx={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(128, 128, 128, 0.2)',
            }}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Box display="flex" flexDirection="column" alignItems="center">
              <CircularProgress />
              <Typography>Loading...</Typography>
            </Box>
          </Box>
        )}
      {loadingState === LoadingState.LOADING &&
        spinningType === SpinningType.NOLOCK && (
          <LinearProgress color="primary" sx={{ width: '100%' }} />
        )}
    </>
  )
}

export default LoadingScreen
