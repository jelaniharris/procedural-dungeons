import { EnemyTouchType } from '@/components/types/GameTypes';
import { Point2D } from '@/utils/Point2D';
import { useLoader } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

type JumpArcArrowProps = {
  start: Point2D;
  end: Point2D;
  touchType: EnemyTouchType;
  arcHeight?: number;
  halfWidth?: number;
  segments?: number;
  /** When true, the texture is stretched once over the full arc.
   *  When false (default), it tiles once per jumped tile. */
  stretchTexture?: boolean;
};

function buildRibbonGeometry(
  curve: THREE.CatmullRomCurve3,
  halfWidth: number,
  segments: number
): THREE.BufferGeometry {
  const points = curve.getPoints(segments);
  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);

  points.forEach((pt, i) => {
    const t = i / (points.length - 1);
    const tangent = curve.getTangentAt(t).normalize();
    const perp = new THREE.Vector3().crossVectors(tangent, up).normalize();

    const left = pt.clone().addScaledVector(perp, -halfWidth);
    const right = pt.clone().addScaledVector(perp, halfWidth);

    vertices.push(left.x, left.y, left.z);
    vertices.push(right.x, right.y, right.z);

    // U flows 0→1 along arc length, V is 0 (left) or 1 (right)
    uvs.push(t, 0);
    uvs.push(t, 1);
  });

  for (let i = 0; i < points.length - 1; i++) {
    const a = i * 2;
    const b = i * 2 + 1;
    const c = i * 2 + 2;
    const d = i * 2 + 3;
    indices.push(a, b, c);
    indices.push(b, d, c);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export default function JumpArcArrow({
  start,
  end,
  touchType,
  arcHeight = 2.0,
  halfWidth = 0.18,
  segments = 30,
  stretchTexture = true,
}: JumpArcArrowProps) {
  const damageSpriteSheet = useLoader(
    THREE.TextureLoader,
    '/textures/StraightDirectionalPathOverlay.png'
  );
  const statusSpriteSheet = useLoader(
    THREE.TextureLoader,
    '/textures/StraightDirectionalPathOverlay.png'
  );

  const texture = useMemo(() => {
    const sheet = [
      EnemyTouchType.TOUCHTYPE_DAMAGE,
      EnemyTouchType.TOUCHTYPE_BOTH,
    ].includes(touchType)
      ? damageSpriteSheet.clone()
      : statusSpriteSheet.clone();

    sheet.minFilter = THREE.NearestFilter;
    sheet.wrapS = THREE.RepeatWrapping;
    if (stretchTexture) {
      sheet.repeat.set(1, 1);
    } else {
      // Tile arrows along the arc — one per tile jumped
      const jumpDist = Math.round(
        Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
      );
      sheet.repeat.set(Math.max(1, jumpDist), 1);
    }
    return sheet;
  }, [damageSpriteSheet, statusSpriteSheet, touchType, start, end, stretchTexture]);

  const geometry = useMemo(() => {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(start.x, 0.1, start.y),
      new THREE.Vector3(midX, arcHeight, midY),
      new THREE.Vector3(end.x, 0.1, end.y),
    ]);
    return buildRibbonGeometry(curve, halfWidth, segments);
  }, [start, end, arcHeight, halfWidth, segments]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      texture.dispose();
    };
  }, [geometry, texture]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        map={texture}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
