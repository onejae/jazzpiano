import { useTransport } from '@providers/TransportProvider'
import { PropsWithChildren } from 'react'

export const TransportGroup = (props: PropsWithChildren) => {
  const { railAngle } = useTransport()

  return (
    <group
      scale={[1, 1, 1]}
      rotation={[railAngle, 0, 0]}
      position={[0, -3.5, 0]}
    >
      {props.children}
    </group>
  )
}
