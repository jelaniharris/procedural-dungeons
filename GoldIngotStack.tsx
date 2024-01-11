/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.14 .\public\models\items\GoldIngotStack.glb -t 
*/

import * as THREE from 'three'
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    GoldBar: THREE.Mesh
    Goldbar: THREE.Mesh
  }
  materials: {
    colormap: THREE.MeshStandardMaterial
  }
}

type ContextType = Record<string, React.ForwardRefExoticComponent<JSX.IntrinsicElements['mesh']>>

export function Model(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/GoldIngotStack.glb') as GLTFResult
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Goldbar.geometry} material={materials.colormap} position={[-0.001, 0.068, 0]} />
      <mesh geometry={nodes.GoldBar.geometry} material={materials.colormap} position={[-0.001, 0.068, 0]} />
    </group>
  )
}

useGLTF.preload('/GoldIngotStack.glb')
