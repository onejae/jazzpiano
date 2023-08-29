import { useState, useRef, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars, Sky } from '@react-three/drei'
import { generateUniqueId } from '@libs/number'

const Star = ({ position, speed, removeStar, uuid }) => {
  const meshRef = useRef<THREE.Mesh>()

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.y -= speed

      if (meshRef.current.position.y < -10) {
        removeStar(uuid)
      }
    }
  })

  return (
    <mesh scale={0.1} ref={meshRef} position={position}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color="white" />
    </mesh>
  )
}

export const MovingStars = () => {
  const [stars, setStars] = useState([])

  const addStar = useCallback(() => {
    const newStar = {
      position: [Math.random() * 100 - 50, 50, 0],
      speed: Math.random() * 3.5 + 0.1,
      uuid: generateUniqueId(),
    }
    setStars((prevStars) => {
      return [...prevStars, newStar]
      if (prevStars.length < 20) return [...prevStars, newStar]
      else {
        console.log(prevStars.length)
        return prevStars
      }
    })
  }, [])

  const removeStar = useCallback((uuid: number) => {
    setStars((prevStars) => {
      const filtered = prevStars.filter((star) => {
        return star.uuid !== uuid
      })

      return filtered
    })
  }, [])

  return (
    <group>
      <Sky
        distance={950000}
        sunPosition={[1, 0, 1]}
        inclination={9}
        azimuth={0.95}
        rayleigh={90}
      />

      <Stars
        radius={0.2}
        depth={50}
        count={5000}
        factor={2}
        saturation={0}
        fade
        speed={1}
      />

      {/* {stars.map((star, index) => (
        <Star
          key={index}
          position={star.position}
          speed={star.speed}
          removeStar={removeStar}
          uuid={star.uuid}
        />
      ))} */}
    </group>
  )
}
