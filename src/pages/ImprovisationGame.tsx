import { RealPiano } from '@components/RealPiano'
import { Box } from '@mui/material'
import { MidiControlProvider } from '@providers/MidiControl'
import { TransportProvider } from '@providers/TransportProvider'

import { TransportGroup } from '@components/TransportGroup'
import { TransportPanel } from '@components/TransportPanel'
import { VirtualPiano } from '@components/VirtualPiano'
import { Canvas } from '@react-three/fiber'

const ImprovisationGame = () => {
  return (
    <Box display="flex" flexDirection={'column'}>
      <Box flexGrow={1}>
        <TransportProvider>
          <div
            style={{ width: '100%', justifyContent: 'center', display: 'flex' }}
          >
            <div
              style={{
                width: '100vw',
                height: 'calc(60vh)',
                backgroundColor: 'white',
              }}
            >
              <Canvas
                onCreated={({ gl }) => {
                  gl.localClippingEnabled = true
                }}
                camera={{
                  position: [0, 0, 13],
                  fov: 45,
                  near: 0.1,
                  far: 200,
                }}
              >
                <ambientLight position={[2, 0, 0]} intensity={0.3} />
                <pointLight position={[-3, 0, 0]} intensity={3.3} />
                <MidiControlProvider>
                  <TransportGroup>
                    <RealPiano />
                    <VirtualPiano />
                  </TransportGroup>
                </MidiControlProvider>
              </Canvas>
            </div>
          </div>
          <TransportPanel />
        </TransportProvider>
      </Box>
    </Box>
  )
}

export default ImprovisationGame
