import {
  Direction,
  MapArea,
  PathCurves,
  TravellingDirection,
} from '@/components/types/GameTypes';
import { Point2D } from './Point2D';

export const checkPointInPoints = (
  needle: Point2D,
  haystack: Point2D[]
): boolean => {
  const foundPoint = false;

  for (const hay of haystack) {
    if (hay.x == needle.x && hay.y == needle.y) {
      return true;
    }
  }

  return foundPoint;
};

export const pointInArea = (point: Point2D, area: MapArea) => {
  if (area.locationsSet && area.locationsSet.has(`${point.x},${point.y}`)) {
    return true;
  }

  return false;
};

export const pointInAreas = (point: Point2D, areas: MapArea[]) => {
  //console.log('[pointInAreas] Checking point', point);
  for (const area of areas) {
    //console.log('Checking area: ', area);
    if (pointInArea(point, area)) {
      //console.log('  Point in area:', point);
      return true;
    }
  }
  //console.log('Point NOT area:', point);
  return false;
};

export const determineTravellingDirection = (from: Point2D, to: Point2D) => {
  const difference: Point2D = { x: to.x - from.x, y: to.y - from.y };

  if (difference.x == 0) {
    if (difference.y < 0) {
      return Direction.DIR_NORTH;
    }
    if (difference.y > 0) {
      return Direction.DIR_SOUTH;
    }
  }
  if (difference.y == 0) {
    if (difference.x < 0) {
      return Direction.DIR_WEST;
    }
    if (difference.x > 0) {
      return Direction.DIR_EAST;
    }
  }
  return Direction.DIR_NONE;
};

export const determinePathDirection = (
  lastDirection: Direction,
  nextDirection: Direction
): TravellingDirection | null => {
  if (
    (lastDirection == Direction.DIR_SOUTH ||
      lastDirection == Direction.DIR_NORTH) &&
    (nextDirection == Direction.DIR_SOUTH ||
      nextDirection == Direction.DIR_NORTH)
  ) {
    return TravellingDirection.DIR_NORTH_SOUTH;
  } else if (
    (lastDirection == Direction.DIR_EAST ||
      lastDirection == Direction.DIR_WEST) &&
    (nextDirection == Direction.DIR_EAST || nextDirection == Direction.DIR_WEST)
  ) {
    return TravellingDirection.DIR_EAST_WEST;
  } else if (
    (lastDirection == Direction.DIR_NORTH &&
      nextDirection == Direction.DIR_WEST) ||
    (lastDirection == Direction.DIR_EAST &&
      nextDirection == Direction.DIR_SOUTH)
  ) {
    return TravellingDirection.DIR_WEST_SOUTH;
  } else if (
    (lastDirection == Direction.DIR_NORTH &&
      nextDirection == Direction.DIR_EAST) ||
    (lastDirection == Direction.DIR_WEST &&
      nextDirection == Direction.DIR_SOUTH)
  ) {
    return TravellingDirection.DIR_EAST_SOUTH;
  } else if (
    (lastDirection == Direction.DIR_EAST &&
      nextDirection == Direction.DIR_NORTH) ||
    (lastDirection == Direction.DIR_SOUTH &&
      nextDirection == Direction.DIR_WEST)
  ) {
    return TravellingDirection.DIR_WEST_NORTH;
  } else if (
    (lastDirection == Direction.DIR_SOUTH &&
      nextDirection == Direction.DIR_EAST) ||
    (lastDirection == Direction.DIR_WEST &&
      nextDirection == Direction.DIR_NORTH)
  ) {
    return TravellingDirection.DIR_EAST_NORTH;
  }
  return null;
};

export type PathChain = {
  curveType: PathCurves;
  tileRotation: number;
  position: Point2D;
};

export const generatePathChain = (points: Point2D[]): PathChain[] => {
  const path: PathChain[] = [];

  //let lastPosition:Point2D|null = null;
  let lastTravelingDirection: Direction = Direction.DIR_NONE;
  points.forEach((point, i) => {
    // Check if this the starting point of the path
    const isStartingPoint = i == 0;

    // Check to see if this is the last point in the movement chain
    const isEndPoint = i == points.length - 1;

    let tileRotation = 0;
    let curveStyle = null;

    const nextPoint = points[i + 1];
    let travelingDirection = Direction.DIR_NONE;
    if (nextPoint) {
      travelingDirection = determineTravellingDirection(point, nextPoint);
    }

    if (!isEndPoint) {
      // Check to see if at starting point
      if (isStartingPoint) {
        const initialRotationDirection = [180, 90, 0, 270];
        if (travelingDirection != Direction.DIR_NONE) {
          tileRotation = initialRotationDirection[travelingDirection];
        }

        path.push({
          curveType: PathCurves.PATH_ORIGIN,
          tileRotation: tileRotation,
          position: point,
        });
      } else {
        // Then a point in the middle
        const pathDirection = determinePathDirection(
          lastTravelingDirection,
          travelingDirection
        );

        switch (pathDirection) {
          case TravellingDirection.DIR_NORTH_SOUTH:
            curveStyle = PathCurves.PATH_STRAIGHT;
            tileRotation = 90;
            break;
          case TravellingDirection.DIR_EAST_WEST:
            curveStyle = PathCurves.PATH_STRAIGHT;
            tileRotation = 0;
            break;
          case TravellingDirection.DIR_WEST_SOUTH:
            curveStyle = PathCurves.PATH_CURVE;
            tileRotation = 0;
            break;
          case TravellingDirection.DIR_WEST_NORTH:
            curveStyle = PathCurves.PATH_CURVE;
            tileRotation = 270;
            break;
          case TravellingDirection.DIR_EAST_NORTH:
            curveStyle = PathCurves.PATH_CURVE;
            tileRotation = 180;
            break;
          case TravellingDirection.DIR_EAST_SOUTH:
            curveStyle = PathCurves.PATH_CURVE;
            tileRotation = 90;
            break;
        }

        path.push({
          curveType: curveStyle || PathCurves.PATH_ORIGIN,
          tileRotation: tileRotation,
          position: point,
        });
      }
    } else {
      // Is at the end
      const rotationDirectionDegrees = [0, 270, 180, 90];
      tileRotation = 0;
      if (lastTravelingDirection != Direction.DIR_NONE) {
        tileRotation = rotationDirectionDegrees[lastTravelingDirection];
      }
      path.push({
        curveType: PathCurves.PATH_DESTINATION,
        tileRotation: tileRotation,
        position: point,
      });
    }

    lastTravelingDirection = travelingDirection;
  });
  return path;
};
