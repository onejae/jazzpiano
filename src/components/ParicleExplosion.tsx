import { useRef, useEffect } from 'react'
import { ThreeElements, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const ParticleExplosion = (args: ThreeElements['group']) => {
  const group = useRef<THREE.Group>()
  const particles = useRef([])

  useEffect(() => {
    const particleCount = 300
    for (let i = 0; i < particleCount; i++) {
      if (group.current) {
        const particle = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        )
        particle.position.set(Math.random() * 60 - 30, Math.random() * 2 - 1, 0)
        group.current.add(particle)
        particles.current.push({
          mesh: particle,
          velocity: new THREE.Vector3(
            Math.random() * 0.5 - 0.25,
            Math.random() * 0.5 - 0.25,
            Math.random() * 0.5 - 0.25
          ),
          lifetime: Math.random() * 60 + 30, // Random lifetime between 30 and 90 frames
        })
      }
    }
  }, [])

  useFrame((_state, delta) => {
    particles.current.forEach((particle) => {
      particle.mesh.position.add(
        particle.velocity.clone().multiplyScalar(delta * 30)
      )
      particle.lifetime -= 1

      if (particle.lifetime <= 0) {
        // Hide particle when its lifetime is over
        particle.mesh.visible = false
      }
    })
  })

  return <group scale={0.1} ref={group} {...args} />
}

export default ParticleExplosion
