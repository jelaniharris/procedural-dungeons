import { FloorModifierType, StatusEffectType, TileType } from '@/components/types/GameTypes';
import { Room } from '@/utils/Bounds2d';
import { Point2D } from '@/utils/Point2D';

// ---------------------------------------------------------------------------
// Visibility states stored per tile in the Uint8Array visibility map
// ---------------------------------------------------------------------------
export const HIDDEN = 0;    // never seen — tile not rendered
export const EXPLORED = 1;  // seen before but not currently visible — rendered, no entities
export const VISIBLE = 2;   // currently in sight — rendered normally

// ---------------------------------------------------------------------------
// Visibility radii
// ---------------------------------------------------------------------------
export const RADIUS_NORMAL = 10;
export const RADIUS_DARKNESS = 9;
export const RADIUS_BLINDNESS = 5;
export const RADIUS_ROOM_CORRIDOR = 4; // fallback radius in corridors under ROOM_DARK

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Flat array index from 2D coordinates. */
export function tileIndex(x: number, y: number, numRows: number): number {
  return x * numRows + y;
}

/**
 * Returns true for tiles that block vision propagation.
 * Walls are still marked VISIBLE when adjacent to a non-blocking tile,
 * but the BFS does not expand through them.
 */
function blocksVision(tile: TileType | null): boolean {
  return (
    tile === null ||
    tile === TileType.TILE_NONE ||
    tile === TileType.TILE_WALL ||
    tile === TileType.TILE_WALL_EDGE ||
    tile === TileType.TILE_WALL_DOOR
  );
}

// ---------------------------------------------------------------------------
// Post-pass: mark diagonal wall neighbours of visible open tiles as VISIBLE.
//
// BFS only propagates through cardinal directions, so a wall that is only
// diagonally adjacent to an open tile (e.g. the corner of a corridor turn)
// would otherwise remain HIDDEN even though the player can clearly see it.
// This pass runs once after the main visibility computation and costs O(n).
// ---------------------------------------------------------------------------
function markDiagonalWalls(
  mapData: (TileType | null)[][],
  numRows: number,
  numCols: number,
  visibilityMap: Uint8Array
): void {
  const DIAG_DX = [1, 1, -1, -1];
  const DIAG_DY = [1, -1, 1, -1];

  for (let x = 0; x < numCols; x++) {
    for (let y = 0; y < numRows; y++) {
      const idx = tileIndex(x, y, numRows);
      if (visibilityMap[idx] !== VISIBLE) continue;
      if (blocksVision(mapData[x]?.[y])) continue; // only expand from open tiles

      for (let d = 0; d < 4; d++) {
        const nx = x + DIAG_DX[d];
        const ny = y + DIAG_DY[d];
        if (nx < 0 || nx >= numCols || ny < 0 || ny >= numRows) continue;
        if (blocksVision(mapData[nx]?.[ny])) {
          visibilityMap[tileIndex(nx, ny, numRows)] = VISIBLE;
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// BFS visibility — blocked by walls, up to `radius` steps from origin
// ---------------------------------------------------------------------------

function bfsVisibility(
  mapData: (TileType | null)[][],
  origin: Point2D,
  radius: number,
  numRows: number,
  numCols: number,
  visibilityMap: Uint8Array
): void {
  // BFS using a simple queue of [x, y, distance] encoded as flat integers
  // to avoid object allocation pressure on large maps.
  const queue: number[] = [];
  const visited = new Uint8Array(numCols * numRows);

  const startIdx = tileIndex(origin.x, origin.y, numRows);
  visited[startIdx] = 1;
  visibilityMap[startIdx] = VISIBLE;
  queue.push(origin.x, origin.y, 0);

  const DX = [1, -1, 0, 0];
  const DY = [0, 0, 1, -1];

  let qi = 0;
  while (qi < queue.length) {
    const cx = queue[qi++];
    const cy = queue[qi++];
    const dist = queue[qi++];

    for (let d = 0; d < 4; d++) {
      const nx = cx + DX[d];
      const ny = cy + DY[d];

      if (nx < 0 || nx >= numCols || ny < 0 || ny >= numRows) continue;

      const nIdx = tileIndex(nx, ny, numRows);
      if (visited[nIdx]) continue;
      visited[nIdx] = 1;

      // Always mark the tile visible — even walls at the boundary are seen.
      visibilityMap[nIdx] = VISIBLE;

      // Only propagate through non-blocking tiles and within radius.
      if (!blocksVision(mapData[nx][ny]) && dist + 1 <= radius) {
        queue.push(nx, ny, dist + 1);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Room-based visibility — reveals the full room the player occupies,
// plus a BFS corridor radius for tiles outside any room.
// ---------------------------------------------------------------------------

function roomBasedVisibility(
  mapData: (TileType | null)[][],
  origin: Point2D,
  rooms: Room[],
  corridorRadius: number,
  numRows: number,
  numCols: number,
  visibilityMap: Uint8Array
): void {
  const playerTile = mapData[origin.x]?.[origin.y];
  const inRoom = playerTile === TileType.TILE_FLOOR_ROOM;

  if (inRoom) {
    // Find which room the player is standing in.
    const currentRoom = rooms.find(
      (r) =>
        origin.x >= r.left &&
        origin.x <= r.right &&
        origin.y >= r.top &&
        origin.y <= r.bottom
    );

    if (currentRoom) {
      // Reveal room interior + surrounding wall ring (left-1 .. right+1, top-1 .. bottom+1)
      for (let x = currentRoom.left - 1; x <= currentRoom.right + 1; x++) {
        for (let y = currentRoom.top - 1; y <= currentRoom.bottom + 1; y++) {
          if (x < 0 || x >= numCols || y < 0 || y >= numRows) continue;
          visibilityMap[tileIndex(x, y, numRows)] = VISIBLE;
        }
      }
      return;
    }
  }

  // Player is in a corridor or room lookup failed — fall back to radius BFS.
  bfsVisibility(mapData, origin, corridorRadius, numRows, numCols, visibilityMap);
}

// ---------------------------------------------------------------------------
// Main entry point — called once per player turn
// ---------------------------------------------------------------------------

export interface VisibilityParams {
  playerPosition: Point2D;
  mapData: (TileType | null)[][];
  rooms: Room[];
  numRows: number;
  numCols: number;
  statusEffects: { statusEffectType: StatusEffectType }[];
  floorModifiers: FloorModifierType[];
  /** Pass the existing Uint8Array to mutate in place; pass null to allocate fresh. */
  current: Uint8Array | null;
}

export function computeVisibility({
  playerPosition,
  mapData,
  rooms,
  numRows,
  numCols,
  statusEffects,
  floorModifiers,
  current,
}: VisibilityParams): Uint8Array {
  const size = numCols * numRows;
  // Always allocate a new array so Zustand detects the reference change and
  // triggers re-renders in subscribed components.
  const visibilityMap = new Uint8Array(size);

  // Carry seen tiles forward: EXPLORED stays EXPLORED, previously VISIBLE
  // tiles become EXPLORED (they were seen last turn but may not be this turn).
  if (current && current.length === size) {
    for (let i = 0; i < size; i++) {
      if (current[i] >= EXPLORED) visibilityMap[i] = EXPLORED;
    }
  }

  const isBlind = statusEffects.some(
    (se) => se.statusEffectType === StatusEffectType.BLINDNESS
  );
  const hasDarkness = floorModifiers.includes(FloorModifierType.DARKNESS);
  const hasRoomDark = floorModifiers.includes(FloorModifierType.ROOM_DARK);

  if (isBlind) {
    bfsVisibility(mapData, playerPosition, RADIUS_BLINDNESS, numRows, numCols, visibilityMap);
  } else if (hasRoomDark) {
    roomBasedVisibility(
      mapData,
      playerPosition,
      rooms,
      RADIUS_ROOM_CORRIDOR,
      numRows,
      numCols,
      visibilityMap
    );
  } else if (hasDarkness) {
    bfsVisibility(mapData, playerPosition, RADIUS_DARKNESS, numRows, numCols, visibilityMap);
  } else {
    bfsVisibility(mapData, playerPosition, RADIUS_NORMAL, numRows, numCols, visibilityMap);
  }

  markDiagonalWalls(mapData, numRows, numCols, visibilityMap);

  return visibilityMap;
}
