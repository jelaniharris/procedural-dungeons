# Code Complexity Audit — procedural-dungeons

**Date:** 2026-03-07
**Scope:** `src/**/*.ts`, `src/**/*.tsx`
**Method:** Manual static analysis + line counting

---

## Summary Table

| #   | Finding                                                                             | Category       | File(s)                                      | Importance |
| --- | ----------------------------------------------------------------------------------- | -------------- | -------------------------------------------- | ---------- |
| 4   | `async` inside `.forEach` — async not awaited                                       | **Bug**        | `stores/enemySlice.ts:396,476`               | **7/10**   |
| 5   | Direct Zustand state mutation in `aiMove`                                           | **Bug**        | `stores/enemySlice.ts:419,424-425`           | **7/10**   |
| 6   | Stale closure in `DungeonScene` `useEffect(…, [])`                                  | **Bug**        | `components/scenes/DungeonScene.tsx:667`     | **6/10**   |
| 7   | `DefaultGameSettings.provisionUnlocks` logic always produces all-false              | **Bug**        | `stores/stageSlice.ts:90-104`                | **5/10**   |
| 9   | Dead code in `Effects` component — early `return` makes vignette unreachable        | **Bug**        | `components/scenes/DungeonScene.tsx:91-109`  | **4/10**   |
| 10  | `playerMoved` switch — CC ~18, 200 lines, massive item dispatch                     | Cyclomatic     | `components/scenes/DungeonScene.tsx:286-498` | **8/10**   |
| 11  | `playerAttemptMove` — CC ~15, nested switch/if, 165 lines                           | Cyclomatic     | `components/scenes/DungeonScene.tsx:500-664` | **7/10**   |
| 12  | `aiCalculateNewDirection` — CC ~14, for→while→switch                                | Cyclomatic     | `stores/enemySlice.ts:239-346`               | **7/10**   |
| 13  | `determineWallType` / `determineLiquidWallType` — CC ~13 each, 100+ line switch     | Cyclomatic     | `stores/mapSlice.ts:700-817, 577-699`        | **6/10**   |
| 14  | `DungeonScene.tsx` — 900 lines, 40 store selectors, all game logic in one component | LOC / Cohesion | `components/scenes/DungeonScene.tsx`         | **8/10**   |
| 15  | `mapSlice.ts` — 1350+ lines, 35+ interface methods, all map concerns in one file    | LOC / Cohesion | `stores/mapSlice.ts`                         | **8/10**   |
| 16  | `playerSlice.ts` — 784 lines, 35+ methods across 5 unrelated responsibilities       | LOC / Cohesion | `stores/playerSlice.ts`                      | **6/10**   |
| 17  | `mapSlice` depends on all 6 other slices — maximum efferent coupling                | Coupling       | `stores/mapSlice.ts:209-219`                 | **7/10**   |
| 18  | Coin/Chalice/Crown/Ingot in `playerMoved` — identical 5-line blocks repeated 4×     | Duplication    | `components/scenes/DungeonScene.tsx:317-385` | **5/10**   |
| 19  | `resetStage` is a 100-line god function orchestrating 20+ calls                     | Cohesion       | `stores/mapSlice.ts:233-335`                 | **5/10**   |
| 20  | `localStorage` calls with no error handling — crashes in SSR/private mode           | Safety         | `stores/stageSlice.ts:243,265,292,321`       | **5/10**   |

---

## Detailed Findings

---

### F-01 — Hardcoded date in `getDailyUniqueSeed`

**Importance: 9/10**
**File:** [src/utils/seed.ts:2](src/utils/seed.ts#L2)

```ts
// CURRENT (broken)
const dailyUniqueDate = new Date('2024-11-08')
  .toISOString()
  .substring(0, 10)
  .replaceAll('-', '');
```

The date `'2024-11-08'` is hardcoded. Every single day — including all future "daily" game sessions — generates the seed `20241108`. The daily mode is effectively identical to adventure mode.

**Fix:**

```ts
export const getDailyUniqueSeed = () => {
  const dailyUniqueDate = new Date() // <-- use current date
    .toISOString()
    .substring(0, 10)
    .replaceAll('-', '');
  return parseInt(dailyUniqueDate, 10);
};
```

---

### F-02 — ~~`generateContainers` saves wrong variable~~ — FALSE POSITIVE

**File:** [src/stores/mapSlice.ts:979](src/stores/mapSlice.ts#L979)

```ts
const newContainerList: ItemContainer[] = itemContainers ?? [];
```

`newContainerList` is **not a copy** — it is the same array reference as `itemContainers` (no spread). Mutations made to `newContainerList` inside the loop are reflected in `itemContainers`. The `set({ itemContainers: itemContainers })` call saves the already-mutated array correctly. Chests do appear.

**Note:** This is an intentional reference-aliasing pattern, not a bug. It is worth documenting with a comment to prevent future confusion, as the naming implies independence between the two variables when there is none.

---

### F-03 — `duration == 0` — comparison used instead of assignment

**Importance: 8/10**
**Files:**

- [src/stores/playerSlice.ts:632](src/stores/playerSlice.ts#L632) (`reduceStatusEffect`)
- [src/stores/playerSlice.ts:701](src/stores/playerSlice.ts#L701) (`tickStatusEffects`)

```ts
// reduceStatusEffect
if (foundStatusEffect.duration < 0) {
  foundStatusEffect.duration == 0; // BUG: no-op comparison, not assignment
}

// tickStatusEffects
if (effect.duration < 0) {
  effect.duration == 0; // same bug
}
```

`==` performs a comparison and discards the result. The duration is never clamped to 0, so it can become arbitrarily negative. Status effects that should expire might never get cleaned up correctly.

**Fix:** Replace both occurrences with `=`:

```ts
foundStatusEffect.duration = 0;
effect.duration = 0;
```

---

### F-04 — `async` callbacks inside `.forEach` — async not awaited

**Importance: 7/10**
**File:** [src/stores/enemySlice.ts:396](src/stores/enemySlice.ts#L396) and [src/stores/enemySlice.ts:476](src/stores/enemySlice.ts#L476)

```ts
// aiMove — line 396
currentEnemies.forEach(async (enemy, i) => {
  // ...async work...
});
// aiMove returns immediately — the forEach callbacks are not awaited

// flagExpiredEnemies — line 476
enemies.forEach(async (enemy) => {
  // ...
});
```

`Array.prototype.forEach` does not await async callbacks. The outer function (`aiMove`) returns a resolved Promise before any enemy has been processed. The `while` loop in `performTurn` that checks `hasMovesLeft` will always see `false` on the first iteration.

**Fix:** Replace with `for...of`:

```ts
// aiMove
for (const [i, enemy] of currentEnemies.entries()) {
  if ((enemy.status & EnemyStatus.STATUS_DEAD) === EnemyStatus.STATUS_DEAD)
    continue;
  if (enemy.movementPoints.length > 0) {
    enemyHasMovementLeft = true;
    // ...rest of logic
  }
}

// flagExpiredEnemies (no async needed here at all — remove async keyword)
for (const enemy of enemies) {
  if ((enemy.status & EnemyStatus.STATUS_DEAD) === EnemyStatus.STATUS_DEAD)
    continue;
  if (
    (enemy.traits & UnitTraits.EXPIRES) === UnitTraits.EXPIRES &&
    enemy.lifetime <= 0
  ) {
    flagEnemyAsDead(enemy);
    flaggedEnemy = true;
  }
}
```

---

### F-05 — Direct Zustand state mutation in `aiMove`

**Importance: 7/10**
**File:** [src/stores/enemySlice.ts:419](src/stores/enemySlice.ts#L419), [src/stores/enemySlice.ts:424-425](src/stores/enemySlice.ts#L424-L425)

```ts
// Direct mutations on the array retrieved from get()
enemy.movementPoints = []; // mutates enemy in-place
currentEnemies[i].position.x = nextLocation.x; // mutates state directly
currentEnemies[i].position.y = nextLocation.y;
currentEnemies[i].lifetime -= 1;
```

Zustand requires returning new objects from `set`. Directly mutating objects retrieved from `get()` bypasses the reactive update system. Subscribers that use shallow equality checks will not re-render.

Also in `aiCalculateNewDirection` (lines 310, 340):

```ts
enemy.nextDirection = { x: movementVector.x, y: movementVector.y }; // mutation
enemy.movementPoints = newPositions; // mutation
```

**Fix:** Build new enemy objects and call `set` with replaced array:

```ts
const updatedEnemies = currentEnemies.map((enemy, i) => {
  if ((enemy.status & EnemyStatus.STATUS_DEAD) === EnemyStatus.STATUS_DEAD)
    return enemy;
  if (enemy.movementPoints.length === 0) return enemy;

  const nextLocation = enemy.movementPoints[0];
  const remainingPoints = enemy.movementPoints.slice(1);
  const locationResult = checkEnemyLocation(nextLocation, enemy);

  if (enemyLocationResultCallback && locationResult !== 0) {
    enemyLocationResultCallback(locationResult, nextLocation, enemy);
    if (
      (locationResult & LocationActionType.TOUCHED_PLAYER) ===
      LocationActionType.TOUCHED_PLAYER
    ) {
      enemyHasMovementLeft = false;
      return { ...enemy, movementPoints: [] };
    }
  }

  enemyHasMovementLeft = true;
  return {
    ...enemy,
    position: { x: nextLocation.x, y: nextLocation.y },
    movementPoints: remainingPoints,
    lifetime: enemy.lifetime > 0 ? enemy.lifetime - 1 : 0,
  };
});
set({ enemies: updatedEnemies });
```

---

### F-06 — Stale closure in `DungeonScene` `useEffect(…, [])`

**Importance: 6/10**
**File:** [src/components/scenes/DungeonScene.tsx:667](src/components/scenes/DungeonScene.tsx#L667)

```ts
React.useEffect(() => {
  const party = async () => {
    // Subscribes using: playerMoved, playerAttemptMove, saveAttempt
    // These are useCallback results from the outer component scope
    subscribe(PLAYER_MOVED, ({ moved }) => {
      playerMoved(moved); // <-- captured at mount time only
    });
    subscribe(PLAYER_ATTEMPT_MOVE, ({ currentPosition, desiredDirection }) => {
      playerAttemptMove(currentPosition, desiredDirection); // <-- stale
    });
  };
  party();
  return () => {
    unsubscribeAllHandlers(PLAYER_MOVED); /* ... */
  };
}, []); // <-- empty deps: callbacks never refreshed
```

`playerMoved` and `playerAttemptMove` are `useCallback` results whose own dependencies include store selectors. When those store selectors return new function references, the outer `useCallback` will produce a new function — but the `subscribe` calls inside the `useEffect` will still hold the stale version from mount time.

**Fix (minimal):** Add the stable callbacks to the dependency array, or switch to a ref pattern:

```ts
const playerMovedRef = useRef(playerMoved);
useEffect(() => {
  playerMovedRef.current = playerMoved;
}, [playerMoved]);

// Inside the subscription:
subscribe(PLAYER_MOVED, ({ moved }) => {
  playerMovedRef.current(moved);
});
```

---

### F-07 — `DefaultGameSettings.provisionUnlocks` is always all-false

**Importance: 5/10**
**File:** [src/stores/stageSlice.ts:90](src/stores/stageSlice.ts#L90)

```ts
provisionUnlocks: new Array(Object.keys(ProvisionType).length)
  .fill(false)          // array is: [false, false, false, ...]
  .map((val) => {       // val is always `false`
    if (
      [
        ProvisionType.BONE_NECKLACE,
        ProvisionType.COIN_PURSE,
        ProvisionType.SPICES,
      ].includes(val)   // false is never in that array
    ) {
      return true;
    }
    return val;         // always returns false
  }),
```

The `.fill(false)` means `val` is always `false`. The `.includes(val)` check tests whether `false` is one of the ProvisionType enum values — it never is. No provisions are ever unlocked by default.

**Fix:**

```ts
const defaultUnlockedProvisions = new Set([
  ProvisionType.BONE_NECKLACE,
  ProvisionType.COIN_PURSE,
  ProvisionType.SPICES,
]);

provisionUnlocks: Object.values(ProvisionType).map(
  (pt) => defaultUnlockedProvisions.has(pt)
),
```

---

### F-08 — `locationLiquidType` misses LAVA and MUD tiles

**Importance: 5/10**
**File:** [src/stores/mapSlice.ts:1139](src/stores/mapSlice.ts#L1139)

```ts
locationLiquidType: (location: Point2D) => {
  const tileType = getTilePosition(location.x, location.y);
  if (
    tileType &&
    [TileType.TILE_WATER, TileType.TILE_POISON].includes(tileType)  // BUG: LAVA and MUD omitted
  ) {
    return getLiquidTypeFromTileType(tileType);
  }
  return LiquidType.LIQUID_NONE;
},
```

This function is called by `generateHazards` to prevent traps spawning on liquids. Because LAVA and MUD are not checked, hazards can be placed on top of those tile types.

**Fix:**

```ts
[
  TileType.TILE_WATER,
  TileType.TILE_POISON,
  TileType.TILE_LAVA,
  TileType.TILE_MUD,
].includes(tileType);
```

---

### F-09 — Dead code in `Effects` component

**Importance: 4/10**
**File:** [src/components/scenes/DungeonScene.tsx:91](src/components/scenes/DungeonScene.tsx#L91)

```ts
function Effects() {
  // ...isTired computed...
  return;                // <-- always exits here

  if (!isTired) {        // unreachable
    return;
  }
  return (               // unreachable
    <EffectComposer>
      <Vignette ... />
    </EffectComposer>
  );
}
```

The unconditional `return;` at line 91 makes every line after it dead code. The vignette effect (intended for when the player is starving) never renders.

**Fix:**

```ts
function Effects() {
  // ...isTired computed...
  if (!isTired) return null;
  return (
    <EffectComposer>
      <Vignette offset={1.5} darkness={1} eskil={true} />
    </EffectComposer>
  );
}
```

---

### F-10 — `playerMoved` — Cyclomatic Complexity ~18, 200 lines

**Importance: 8/10**
**File:** [src/components/scenes/DungeonScene.tsx:286](src/components/scenes/DungeonScene.tsx#L286)

The `playerMoved` callback spans lines 286–498 (~212 lines). It contains:

- A 10-branch `switch` on `ItemType` (~130 lines)
- Multiple bitwise `LocationActionType` checks
- Inline audio calls, score calls, status effect calls, overlay publishes
- Direct `aiTurn()` call at the end

Additionally, four item types (COIN, CHALICE, CROWN, INGOT_STACK) are near-identical:

```ts
case ItemType.ITEM_COIN:
  playAudio('coin.ogg');
  const coinScore = addScore(itemData?.scoreValue ?? 0, SourceType.TREASURE);
  publish<OverlayTextEvent>(OVERLAY_TEXT, { type: OverLayTextType.OVERLAY_SCORE, amount: coinScore, mapPosition: locationAction.position });
  break;
case ItemType.ITEM_CHALICE:
  playAudio('coin.ogg');
  const chaliceScore = addScore(itemData?.scoreValue ?? 0, SourceType.TREASURE);
  publish<OverlayTextEvent>(OVERLAY_TEXT, { type: OverLayTextType.OVERLAY_SCORE, amount: chaliceScore, mapPosition: locationAction.position });
  break;
// ... CROWN and INGOT_STACK are identical
```

**Fix — extract item handler and shared helper:**

```ts
const publishScoreOverlay = (amount: number, position: Point2D) =>
  publish<OverlayTextEvent>(OVERLAY_TEXT, {
    type: OverLayTextType.OVERLAY_SCORE,
    amount,
    mapPosition: position,
  });

const COIN_TYPES = [ItemType.ITEM_COIN, ItemType.ITEM_CHALICE, ItemType.ITEM_CROWN, ItemType.ITEM_INGOT_STACK];

// In switch:
case ItemType.ITEM_COIN:
case ItemType.ITEM_CHALICE:
case ItemType.ITEM_CROWN:
case ItemType.ITEM_INGOT_STACK:
  playAudio('coin.ogg');
  publishScoreOverlay(addScore(itemData?.scoreValue ?? 0, SourceType.TREASURE), locationAction.position);
  break;
```

Then extract `handleItemCollection`, `handleLocationAction`, and `handlePlayerStanding` as separate named functions outside the component.

---

### F-11 — `playerAttemptMove` — Cyclomatic Complexity ~15

**Importance: 7/10**
**File:** [src/components/scenes/DungeonScene.tsx:500](src/components/scenes/DungeonScene.tsx#L500)

165-line async function with:

- Confusion status check with random branch
- `checkIfWalkable` returns two different code paths (walkable / blocked)
- Nested `switch` inside walkable path (`THROUGH_ENEMY`)
- Nested `switch` inside blocked path (`BLOCK_DESTRUCTIBLE`, `BLOCK_ENEMY`, `BLOCK_WALL`, `BLOCK_NONE`)
- Chest-opening logic in the `else` (no direction)

**Fix:** Split into three focused functions:

```ts
const handleWalkableMove = useCallback(async (playerGO, nextPosition, checkWalkable) => { ... }, [...]);
const handleBlockedMove = useCallback((playerGO, nextPosition, checkWalkable, isConfused) => { ... }, [...]);
const handleWaitAction = useCallback((currentPosition) => { ... }, [...]);
```

---

### F-12 — `aiCalculateNewDirection` — Cyclomatic Complexity ~14

**Importance: 7/10**
**File:** [src/stores/enemySlice.ts:239](src/stores/enemySlice.ts#L239)

108-line function with:

- Outer `for` loop over all enemies
- Inner `while` loop for move budget
- `switch` on 5 direction cases inside the while
- 3 status effect conditionals modifying `amountOfMoves`
- Tile type water check (reduces moves)
- Exit tile check (adds to danger zones)

The direction `switch` can be replaced with a lookup map:

```ts
const DIRECTION_VECTORS: Record<Direction, Point2D> = {
  [Direction.DIR_NORTH]: { x: 0, y: -1 },
  [Direction.DIR_EAST]: { x: 1, y: 0 },
  [Direction.DIR_SOUTH]: { x: 0, y: 1 },
  [Direction.DIR_WEST]: { x: -1, y: 0 },
  [Direction.DIR_NONE]: { x: 0, y: 0 },
};
// Replace the switch with:
const movementVector = DIRECTION_VECTORS[selectedDirection] ?? { x: 0, y: 0 };
```

---

### F-13 — `determineWallType` / `determineLiquidWallType` — CC ~13 each

**Importance: 6/10**
**Files:** [src/stores/mapSlice.ts:700](src/stores/mapSlice.ts#L700), [src/stores/mapSlice.ts:577](src/stores/mapSlice.ts#L577)

Both functions use bitwise wall detection and a switch with 16 cases. The logic is correct but the two functions are nearly copy-pasted from each other with slightly different output types (`WallType` vs `LiquidWallType`). The rotation lookup tables are also inlined as raw objects.

**Fix — extract shared rotation maps:**

```ts
const TRISIDE_ROTATIONS: Record<number, number> = {
  1: 0,
  2: 90,
  4: 180,
  8: 270,
};
const PARTIAL_ROTATIONS: Record<number, number> = {
  13: 0,
  11: 90,
  14: 270,
  7: 180,
};
const L_ROTATIONS: Record<number, number> = { 3: 90, 9: 0, 12: 270, 6: 180 };
```

Then parameterise the core logic into a shared `computeBitwiseWallConfig(x, y)` that both functions call.

---

### F-14 — `DungeonScene.tsx` — 900 lines, 40 store selectors, monolithic

**Importance: 8/10**
**File:** [src/components/scenes/DungeonScene.tsx](src/components/scenes/DungeonScene.tsx)

Lines 112–196 contain **40 individual `useStore` selector calls**. Every selector is a separate closure that subscribes to the store. This pattern is fine per-selector, but at this density it signals the component is doing too much.

The single component handles:

- Event subscription setup (15+ subscriptions in one `useEffect`)
- Player movement logic
- Player combat logic
- Item collection + scoring
- AI turn orchestration
- Audio playback
- UI state (dialogs, pause)
- 3D scene rendering

**Recommended split:**

| New File                     | Responsibility                      |
| ---------------------------- | ----------------------------------- |
| `hooks/useDungeonEvents.ts`  | All `subscribe`/`unsubscribe` calls |
| `hooks/usePlayerMovement.ts` | `playerMoved`, `playerAttemptMove`  |
| `hooks/useAiTurn.ts`         | `aiTurn` logic                      |
| `DungeonScene.tsx`           | Pure render tree only               |

---

### F-15 — `mapSlice.ts` — 1350+ lines, 35+ methods, low cohesion

**Importance: 8/10**
**File:** [src/stores/mapSlice.ts](src/stores/mapSlice.ts)

The `MapSlice` interface declares 35+ methods spanning completely different concerns:

| Concern               | Methods                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| Map generation        | `generateMap`, `resetMap`, `resetStage`, `binarySplitMap`, `createRooms`                       |
| Wall detection        | `isBlockWallOrNull`, `determineWallType`, `countSurroundingWalls`, `checkAllLocationsForWalls` |
| Path finding / areas  | `getAdjacentArea`, `getAreasFromMap`, `fillMapGaps`, `getWanderingNodeLocations`               |
| Liquid system         | `generateLiquids`, `getLiquidSpreadLocations`, `determineLiquidWallType`, `locationLiquidType` |
| Items                 | `generateItems`, `getItemPosition`, `addItem`, `resetItems`                                    |
| Destructibles         | `reduceHealthDestructible`, `locationHasDestructible`, `spawnDestructableItem`                 |
| Containers            | `generateContainers`, `getContainerAtLocation`, `openContainer`                                |
| Hazards / danger mode | `checkDangerState`, `executeDangerMode`, `addSpawnWarning`                                     |
| Projectiles           | `spawnProjectile`, `deleteProjectile`                                                          |
| Doors                 | `generateDoors`, `isBlockDoorCandidate`, `getAllDoorLocations`                                 |

**Recommended split:**

```
stores/
  mapSlice.ts          (core tile data, resetStage, generateMap)
  mapAreaSlice.ts      (getAdjacentArea, getAreasFromMap, fillMapGaps, doors)
  mapItemSlice.ts      (items, destructibles, containers)
  mapLiquidSlice.ts    (liquid generation, liquid wall types)
  mapHazardSlice.ts    (danger mode, spawn warnings, projectiles)
```

---

### F-16 — `playerSlice.ts` — 784 lines, 5 mixed responsibilities

**Importance: 6/10**
**File:** [src/stores/playerSlice.ts](src/stores/playerSlice.ts)

Handles: position/movement, health/energy/attacks, status effects, provisions, upgrades, keys, currency. Interface has 35+ method signatures.

**Recommended split:**

| New Slice                 | Methods                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| `playerCombatSlice.ts`    | `adjustHealth`, `canPlayerAttackEnemy`, `playerPerformAttack`, `adjustAttacks`               |
| `playerStatusSlice.ts`    | `addStatusEffect`, `hasStatusEffect`, `tickStatusEffects`, `purgeExpiredStatusEffects`, etc. |
| `playerInventorySlice.ts` | `hasProvision`, `addProvision`, `adjustKeys`, `adjustCurrency`, `getUpgradeValue`            |

---

### F-17 — `mapSlice` maximum efferent coupling

**Importance: 7/10**
**File:** [src/stores/mapSlice.ts:209](src/stores/mapSlice.ts#L209)

```ts
export const createMapSlice: StateCreator<
  MapSlice &
    StageSlice &    // +1
    PlayerSlice &   // +2
    EnemySlice &    // +3
    HazardSlice &   // +4
    AudioSlice &    // +5
    GeneratorSlice, // +6
  ...
```

`mapSlice` depends on every other slice. This creates a circular dependency web — every slice indirectly depends on every other. Adding a new feature anywhere risks breaking something everywhere.

The instability index for `mapSlice` is near 1.0 (all efferent, few afferent outside the store combiner).

**Fix:** The splitting described in F-15 also reduces coupling. Slices that don't need player/enemy state should not receive them through the generic.

---

### F-18 — Duplicate treasure-item handling in `playerMoved`

**Importance: 5/10**
**File:** [src/components/scenes/DungeonScene.tsx:317](src/components/scenes/DungeonScene.tsx#L317)

Four switch cases (COIN, CHALICE, CROWN, INGOT_STACK) execute identical logic — audio `'coin.ogg'`, `addScore`, `publish OVERLAY_SCORE` — with only variable names differing. See F-10 for the fix snippet.

---

### F-19 — `resetStage` god function — 100 lines, 20+ calls

**Importance: 5/10**
**File:** [src/stores/mapSlice.ts:233](src/stores/mapSlice.ts#L233)

`resetStage` gathers 20+ function references from `get()`, generates 11 sub-seeds, runs the full map generation pipeline, and sets state. It is the single most important function in the game but has no unit test surface and is impossible to test in isolation.

**Fix:** Break out a `StageOrchestrator` (outside the store) that accepts pure functions as arguments, making it testable:

```ts
// Pure orchestration — no get()/set() inside
export function buildStageGenerationPipeline(
  seeds: SeedMap,
  generators: StageGenerators
) {
  const mapData = generators.generateMap(seeds.map);
  const { rooms } = generators.binarySplitMap(mapData, seeds.rooms, 6, 6);
  // ...
  return mapData;
}
```

---

### F-20 — `localStorage` calls with no error handling

**Importance: 5/10**
**File:** [src/stores/stageSlice.ts:243](src/stores/stageSlice.ts#L243), [src/stores/stageSlice.ts:265](src/stores/stageSlice.ts#L265), [src/stores/stageSlice.ts:292](src/stores/stageSlice.ts#L292), [src/stores/stageSlice.ts:321](src/stores/stageSlice.ts#L321)

```ts
localStorage.getItem('AllAttempts'); // throws in SSR, private browsing quota
localStorage.setItem('AllAttempts', JSON.stringify(lastRun)); // throws on quota exceeded
```

These calls throw in: SSR (Next.js server render), iOS private browsing, and when storage quota is exceeded. An unhandled exception here crashes the entire game save/load path.

**Fix:**

```ts
function safeLocalGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeLocalSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`[storage] Failed to save key "${key}"`);
  }
}
```

---

## Metrics Summary

| File               | Est. Lines | CC (max function)               | Cohesion | Efferent Deps |
| ------------------ | ---------- | ------------------------------- | -------- | ------------- |
| `mapSlice.ts`      | ~1350      | ~14 (`determineWallType`)       | Very Low | 6 slices      |
| `playerSlice.ts`   | ~784       | ~12 (`checkPlayerLocation`)     | Low      | 3 slices      |
| `DungeonScene.tsx` | ~900       | ~18 (`playerMoved`)             | Very Low | 40 selectors  |
| `enemySlice.ts`    | ~492       | ~14 (`aiCalculateNewDirection`) | Medium   | 4 slices      |
| `stageSlice.ts`    | ~330       | ~8 (`performTurn`)              | Medium   | 5 slices      |
| `hazardSlice.ts`   | ~163       | ~6 (`generateHazards`)          | High     | 4 slices      |
| `gridUtils.ts`     | ~214       | ~10 (`generatePathChain`)       | High     | 0             |
| `seed.ts`          | ~8         | ~1                              | High     | 0             |

---

## Priority Remediation Order

1. **F-01** — Fix `seed.ts` hardcoded date (1-line fix, critical gameplay bug)
2. ~~**F-03**~~ — ~~Fix `== 0` typo in `playerSlice`~~ — **Fixed**
3. **F-04 + F-05** — Fix `async forEach` + state mutation in `enemySlice` (AI correctness)
4. **F-10 + F-11** — Refactor `playerMoved` / `playerAttemptMove` out of `DungeonScene`
5. **F-09** — Fix dead `return` in `Effects` (uncomment the vignette feature)
6. **F-07** — Fix `provisionUnlocks` default logic
7. **F-08** — Add LAVA + MUD to `locationLiquidType`
8. **F-14 / F-15 / F-16** — Structural splits (larger effort, lower urgency)
9. **F-20** — Wrap `localStorage` calls in safe helpers
