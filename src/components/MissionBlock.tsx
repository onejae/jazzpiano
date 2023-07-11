import { Text } from '@react-three/drei'
interface MissionBlockProps {
  key: string
  scaleType: string
  startFrom: number
}

export const MissionBlock = (props: MissionBlockProps) => {
  return (
    <group>
      <mesh>
        <Text scale={[0.5, 0.5, 0.5]} color={'red'}>
          {props.key}
        </Text>
      </mesh>
    </group>
  )
}
