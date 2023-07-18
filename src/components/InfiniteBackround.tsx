import React, { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'

const Star = ({ position, speed, removeStar }) => {
  const meshRef = useRef()

  useFrame(() => {
    // Move the star down according to its speed
    meshRef.current.position.y -= speed

    // If the star is out of range, mark it for removal
    if (meshRef.current.position.y < -100) {
      removeStar(meshRef.current)
    }
  })

  return (
    <mesh scale={0.1} ref={meshRef} position={position}>
      <sphereBufferGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color="white" />
    </mesh>
  )
}

export const MovingStars = () => {
  const [stars, setStars] = useState([])

  // Function to add a new star to the scene with random properties
  const addStar = () => {
    const newStar = {
      position: [Math.random() * 100 - 50, 50, 0], // Random position within the canvas
      speed: Math.random() * 3.5 + 0.1, // Random speed between 0.1 and 0.6
    }
    setStars((prevStars) => [...prevStars, newStar])
  }

  // Function to remove the star from the scene and perform cleanup
  const removeStar = (mesh) => {
    setStars((prevStars) => prevStars.filter((star) => star.meshRef !== mesh))
    // The actual removal of the mesh from the scene is done automatically by React Three Fiber
  }

  // Use a useEffect to continuously add new stars forever
  useEffect(() => {
    const intervalId = setInterval(addStar, 200) // Add a new star every 0.5 seconds
    return () => clearInterval(intervalId) // Cleanup the interval on unmount
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
