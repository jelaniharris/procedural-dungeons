/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.14 .\public\models\traps\ArrowTrap.glb -t 
*/

import { useStore } from '@/stores/useStore';
import { Point2D } from '@/utils/Point2D';
import { useGLTF } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import { v4 as uuidv4 } from 'uuid';
import useGameObjectEvent from '../entities/useGameObjectEvent';
import {
  OnTickEvent,
  PLAYER_DAMAGED_TRAP,
  PROJECTILE_CREATE,
  ProjectileCreateEvent,
} from '../types/EventTypes';
import { Direction, Hazard, ProjectileType } from '../types/GameTypes';
import useGame from '../useGame';

type GLTFResult = GLTF & {
  nodes: {
    DartBarrel: THREE.Mesh;
    DartBase: THREE.Mesh;
  };
  materials: {
    ['colormap.019']: THREE.MeshStandardMaterial;
    ['colormap.018']: THREE.MeshStandardMaterial;
  };
};

type ArrowTrapProps = JSX.IntrinsicElements['group'] & {
  data: Hazard;
};

export function ArrowTrap(props: ArrowTrapProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { nodes, materials } = useGLTF(
    '/models/traps/ArrowTrap.glb'
  ) as GLTFResult;
  const currentLevel = useStore((state) => state.currentLevel);
  const getLocationsInLine = useStore((state) => state.getLocationsInLine);
  const addLocationsToDangerZones = useStore(
    (state) => state.addLocationsToDangerZones
  );
  const playerInDamageZone = useStore((state) => state.playerInDamageZone);
  const hurtLocations = useRef<Point2D[]>([]);
  const { publish } = useGame();

  const currentPhase = useRef(
    currentLevel >= 3 ? Math.floor(Math.random() * 4) : 1
  );
  const maxPhase = 4;
  const isActive = useRef(false);

  useGameObjectEvent<OnTickEvent>('on-tick', () => {
    if (isActive.current) {
      isActive.current = false;
      currentPhase.current = maxPhase;
    } else {
      currentPhase.current -= 1;

      // Phase before trigger = give the player a warning
      if (currentPhase.current == 1) {
        const travelLocations = getLocationsInLine(
          props.data.worldPosition,
          props.data.facingDirection ?? Direction.DIR_NONE,
          5
        );
        hurtLocations.current = travelLocations;
        if (travelLocations.length > 0) {
          addLocationsToDangerZones(travelLocations);
        }
      }

      if (currentPhase.current <= 0) {
        // Trap is active, do damage if the player is on the danger zones
        isActive.current = true;
        //setAnimation('show');
        if (hurtLocations.current && hurtLocations.current.length > 0) {
          publish<ProjectileCreateEvent>(PROJECTILE_CREATE, {
            projectile: {
              id: uuidv4(),
              worldPosition: {
                x: hurtLocations.current[0].x,
                y: hurtLocations.current[0].y,
              },
              destLocation:
                hurtLocations.current[hurtLocations.current.length - 1],
              projectileType: ProjectileType.BEAM_ARROW,
              travelDirection: props.data.facingDirection ?? Direction.DIR_NONE,
              travelSpeedPerTile: 150,
              hurtLocations: [...hurtLocations.current],
              beforeDestroy: () => {
                if (playerInDamageZone(hurtLocations.current)) {
                  publish(PLAYER_DAMAGED_TRAP, { hazard: props.data });
                }
              },
            },
          });
        }
      }
    }
  });

  return (
    <group {...props} ref={groupRef} dispose={null}>
      <group>
        <mesh
          geometry={nodes.DartBarrel.geometry}
          material={materials['colormap.019']}
          position={[0, 0.213, -0.194]}
          scale={[1, 1.01, 1]}
        />
        <mesh
          geometry={nodes.DartBase.geometry}
          material={materials['colormap.018']}
          position={[0, 0.224, 0.093]}
          scale={[1, 1.01, 1]}
        />
      </group>
    </group>
  );
}

useGLTF.preload('/models/traps/ArrowTrap.glb');
