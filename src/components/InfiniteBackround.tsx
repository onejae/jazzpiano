import { useState, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'

const Star = ({ position, speed, removeStar }) => {
  const meshRef = useRef<THREE.Mesh>()

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.y -= speed

      if (meshRef.current.position.y < -100) {
        removeStar(meshRef.current)
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

  const addStar = () => {
    const newStar = {
      position: [Math.random() * 100 - 50, 50, 0],
      speed: Math.random() * 3.5 + 0.1,
    }
    setStars((prevStars) => [...prevStars, newStar])
  }

  const removeStar = (mesh) => {
    setStars((prevStars) => prevStars.filter((star) => star.meshRef !== mesh))
  }

  useEffect(() => {
    const intervalId = setInterval(addStar, 200)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <>
      <Stars />
      {stars.map((star, index) => (
        <Star
          key={index}
          position={star.position}
          speed={star.speed}
          removeStar={removeStar}
        />
      ))}
    </>
  )
}
