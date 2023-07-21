import { gameState } from '@providers/GameState'
import { Text } from '@react-three/drei'
import { ThreeElements, useFrame } from '@react-three/fiber'
import { useState } from 'react'

const SECONDS_TO_BIG = 0.5
const SECONDS_TO_SMALL = 0.5
const MAX_SCALE = 2

type ComboRenderState = 'INIT' | 'MOVING_IN' | 'SCALING_UP' | 'SCALING_DOWN'

export const ComboBox = (args: ThreeElements['mesh']) => {
  const [numberScale, setNumberScale] = useState(1)
  const [combo, setCombo] = useState(0)
  const [comboRenderState, setComboRenderState] =
    useState<ComboRenderState>('INIT')

  useFrame((_state, delta) => {
    if (gameState.combo != combo) {
      setCombo(gameState.combo)
    }
  })

  return (
    <mesh {...args}>
      <Text
        letterSpacing={0.2}
        outlineWidth={0.1}
        outlineColor={'white'}
        strokeWidth={0.2}
        strokeColor={'black'}
        scale={numberScale}
        color={'white'}
        position={[0, 0, 0]}
        anchorX="center"
        anchorY="middle"
      >
        {combo}
      </Text>
      <Text
        letterSpacing={0.2}
        outlineWidth={0.1}
        outlineColor={'white'}
        strokeWidth={0.2}
        strokeColor={'black'}
        scale={[1, 1, 1]}
        color={'white'}
        position={[2.8, 0, 0]}
        anchorX="center"
        anchorY="middle"
      >
        Combo
      </Text>
    </mesh>
  )
}
