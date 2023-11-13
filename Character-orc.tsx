/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.14 .\public\models\characters\character-orc.glb -t 
*/

import * as THREE from 'three'
import React, { useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    ['leg-left']: THREE.Mesh
    ['leg-right']: THREE.Mesh
    torso: THREE.Mesh
    ['arm-left']: THREE.Mesh
    ['arm-right']: THREE.Mesh
    head: THREE.Mesh
  }
  materials: {
    colormap: THREE.MeshStandardMaterial
  }
}

type ActionName = 'static' | 'idle' | 'walk' | 'sprint' | 'jump' | 'fall' | 'crouch' | 'sit' | 'drive' | 'die' | 'pick-up' | 'emote-yes' | 'emote-no' | 'holding-right' | 'holding-left' | 'holding-both' | 'holding-right-shoot' | 'holding-left-shoot' | 'holding-both-shoot' | 'attack-melee-right' | 'attack-melee-left' | 'attack-kick-right' | 'attack-kick-left' | 'interact-right' | 'interact-left'
type GLTFActions = Record<ActionName, THREE.AnimationAction>

type ContextType = Record<string, React.ForwardRefExoticComponent<JSX.IntrinsicElements['mesh']>>

export function Model(props: JSX.IntrinsicElements['group']) {
  const group = useRef<THREE.Group>()
  const { nodes, materials, animations } = useGLTF('/character-orc.glb') as GLTFResult
  const { actions } = useAnimations<GLTFActions>(animations, group)
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="character-orc">
        <group name="character-orc_1">
          <group name="root">
            <mesh name="leg-left" geometry={nodes['leg-left'].geometry} material={materials.colormap} position={[0.084, 0.176, -0.024]} />
            <mesh name="leg-right" geometry={nodes['leg-right'].geometry} material={materials.colormap} position={[-0.084, 0.176, -0.024]} />
            <mesh name="torso" geometry={nodes.torso.geometry} material={materials.colormap} position={[0, 0.176, -0.024]}>
              <mesh name="arm-left" geometry={nodes['arm-left'].geometry} material={materials.colormap} position={[0.1, 0.112, 0.011]} />
              <mesh name="arm-right" geometry={nodes['arm-right'].geometry} material={materials.colormap} position={[-0.1, 0.112, 0.011]} />
              <mesh name="head" geometry={nodes.head.geometry} material={materials.colormap} position={[0, 0.167, 0.026]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/character-orc.glb')
