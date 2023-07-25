import { gameState } from '@providers/GameState'
import { Text } from '@react-three/drei'
import { ThreeElements, useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { Vector3 } from 'three'

const MAX_SCALE = 2
const SCALE_UP_TIME = 0.06

type ComboRenderState =
  | 'INIT'
  | 'MOVING_IN'
  | 'SCALING_UP'
  | 'SCALING_DOWN'
  | 'WAITING'

const MOVING_IN_FROM_X = -7
const MOVING_IN_TIME = 0.1

export const ComboBox = (args: ThreeElements['mesh']) => {
  const [numberScale, setNumberScale] = useState(1)
  const [combo, setCombo] = useState(0)
  const comboRenderStateRef = useRef<ComboRenderState>('INIT')
  const renderTimer = useRef(0)

  const [groupPosition, setGroupPosition] = useState<Vector3>(
    new Vector3(MOVING_IN_FROM_X, 0, 0)
  )

  useFrame((_state, delta) => {
    if (gameState.combo != combo) {
      renderTimer.current = 0

      if (gameState.combo === 0) {
        comboRenderStateRef.current = 'INIT'
        setGroupPosition(new Vector3(MOVING_IN_FROM_X, 0, 0))
      } else {
        comboRenderStateRef.current =
          comboRenderStateRef.current === 'INIT' ? 'MOVING_IN' : 'SCALING_UP'
      }

      setCombo(gameState.combo)
    }

    if (comboRenderStateRef.current === 'MOVING_IN') {
      const newPositionX =
        MOVING_IN_FROM_X +
        -MOVING_IN_FROM_X * (renderTimer.current / MOVING_IN_TIME)

      if (newPositionX >= 0) {
        renderTimer.current = 0
        comboRenderStateRef.current = 'WAITING'
        setGroupPosition(new Vector3(0, 0, 0))
      } else {
        setGroupPosition(new Vector3(newPositionX, 0, 0))
      }
    } else if (comboRenderStateRef.current === 'SCALING_UP') {
      const newScale =
        1 + (MAX_SCALE - 1) * (renderTimer.current / SCALE_UP_TIME)

      if (newScale >= MAX_SCALE) {
        comboRenderStateRef.current = 'SCALING_DOWN'
        renderTimer.current = 0
        setNumberScale(MAX_SCALE)
      } else {
        setGroupPosition(new Vector3(0, 0, 0))
        setNumberScale(newScale)
      }
    } else if (comboRenderStateRef.current === 'SCALING_DOWN') {
      const newScale =
        MAX_SCALE - (MAX_SCALE - 1) * (renderTimer.current / SCALE_UP_TIME)

      if (newScale <= 1) {
        comboRenderStateRef.current = 'WAITING'

        setNumberScale(1)
      } else {
        setNumberScale(newScale)
      }
    }

    renderTimer.current += delta
  })

  if (gameState.combo === 0) return <></>

  return (
    <mesh {...args}>
      <group position={groupPosition}>
        <Text
          letterSpacing={0.2}
          outlineWidth={0.1}
          outlineColor={'black'}
          strokeWidth={0.3}
          strokeColor={'yellow'}
          scale={numberScale}
          color={'white'}
          position={[0, 0, 0]}
          anchorX="center"
          anchorY="middle"
          rotation={[0, 0.9, 0.1]}
        >
          {combo}
        </Text>
        <Text
          scale={[1, 1, 1]}
          outlineWidth={0.1}
          outlineColor={'black'}
          color={'white'}
          position={[0.8, 0, 0]}
          rotation={[0, 0.9, 0.1]}
          anchorX="left"
          anchorY="middle"
        >
          Combo
        </Text>
      </group>
    </mesh>
  )
}
