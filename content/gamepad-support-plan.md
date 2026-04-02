# Plan: Full Gamepad Support

## Context
The game currently supports keyboard (WASD/arrows), touch D-pad, and virtual joystick. Menus are pointer-only (mouse/touch). This plan adds full gamepad support: dungeon movement and complete menu navigation. The menus were never designed for non-pointer input, so this requires a focus management layer on top of the existing UI.

---

## Part 1: Dungeon Movement (Simpler)

All input methods converge on publishing `PLAYER_ATTEMPT_MOVE` with a direction. Gamepad movement just needs to publish the same event.

### New file: `src/components/GamepadController.tsx`

A `null`-rendering React component mounted **outside the Canvas** (same pattern as `DirectionalPads` and `GuiButtons`).

**Responsibilities:**
- Poll `navigator.getGamepads()` via `requestAnimationFrame` in a `useEffect`
- Track previous button state in a `prevButtons` ref for **edge detection** (fire once per press — critical for turn-based)
- Use a `gameStatusRef` synced via a separate `useEffect` to avoid stale closures
- Route input based on context: game movement vs. menu navigation (see Part 2)

**Standard Gamepad Button Mapping (Gamepad API):**
```
Button 0  = A (South)      → wait/stall (DIR_NONE)
Button 1  = B (East)       → back (in menus)
Button 3  = Y (North)      → open store/stats
Button 8  = Select         → open store/stats
Button 9  = Start          → open settings
Button 12 = D-Pad Up       → DIR_NORTH (game) / navigate up (menu)
Button 13 = D-Pad Down     → DIR_SOUTH (game) / navigate down (menu)
Button 14 = D-Pad Left     → DIR_WEST  (game) / navigate left (menu)
Button 15 = D-Pad Right    → DIR_EAST  (game) / navigate right (menu)
Axis 0    = Left stick horizontal
Axis 1    = Left stick vertical (deadzone: 0.5, time-gate: 200ms between moves)
```

**Mount location:** `src/components/Game.tsx` — add `<GamepadController />` alongside `<DirectionalPads />` inside `GameContext.Provider` but outside `Canvas`.

---

## Part 2: Menu Navigation (More Complex)

### The Problem
Menus use click/tap on `<div>` and `<button>` elements. Gamepad needs a software cursor that moves between items on D-pad press. The browser's native focus system doesn't match spatial D-pad navigation, so a custom layer is needed.

### Architecture: Gamepad Navigation Context

**New file: `src/components/gamepad/GamepadNavigationContext.tsx`**

React context + hook that manages focus state:

```typescript
interface GamepadNavigationContextValue {
  focusedIndex: number;
  itemCount: number;
  gridCols: number;            // 1 = list, 2+ = grid
  navigate: (dir: Direction) => void;
  activate: () => void;        // triggers focused item
  back: () => void;            // fires registered onBack
  register: (items: GamepadItem[], onBack: () => void, gridCols?: number) => void;
  unregister: () => void;
}

interface GamepadItem {
  onSelect: () => void;        // what happens when A is pressed
  label?: string;              // for debugging
}
```

**New hook: `src/hooks/useGamepadFocus.ts`**

Each screen calls this to register itself as the active navigation target:

```typescript
function useGamepadFocus(
  items: GamepadItem[],
  onBack: () => void,
  gridCols: number = 1
): { focusedIndex: number }
```

- Calls `register()` on mount, `unregister()` on unmount
- Returns `focusedIndex` so the screen can highlight the correct item

**Navigation logic (inside context):**
- List (gridCols=1): Up/Down wraps around
- Grid (gridCols=N): Up/Down moves rows, Left/Right moves columns
- Activate: calls `items[focusedIndex].onSelect()`
- Back: calls registered `onBack` callback

### `GamepadController` menu mode

When `gameStatus !== GAME_STARTED`:
- D-pad/stick → `navigate(direction)` on `GamepadNavigationContext`
- A button → `activate()`
- B button → `back()`
- No movement events published

### Visual Highlight

**Modify: `src/components/input/Button.tsx`**
Add optional `gamepadFocused?: boolean` prop → applies `ring-4 ring-yellow-400` (distinct from hover, visible on all backgrounds).

Same prop pattern on provision cards in `ProvisionSelector.tsx`.

---

## Per-Screen Integration Plan

| Screen | File | gridCols | Items to register | onBack |
|--------|------|----------|-------------------|--------|
| `MainScreen` | `src/components/hud/Menu/MainScreen.tsx` | 1 | Play, Tutorial, Scores, Settings | — (top of stack) |
| `PlayScreen` | `src/components/hud/Menu/PlayScreen.tsx` | 1 | Daily, Adventure, Change Name, Back | `popScreen()` |
| `ScoresScreen` | `src/components/hud/Menu/ScoresScreen.tsx` | 1 | Last Climbs tab, Daily tab, Adventure tab, Back | `popScreen()` |
| `TutorialScreen` | `src/components/hud/Menu/TutorialScreen.tsx` | 2 | Prev, Next (+ Back on page 1) | `popScreen()` |
| `EmbarkScreen` | `src/components/hud/Embark/EmbarkScreen.tsx` | 3 | All provision cards + Embark + Back to Menu | `publish(CHANGE_SCENE, 'menu')` |
| `ExitOption` | `src/components/hud/ExitOption.tsx` | 4 | NEED, GREED, STORE, RETURN | `publish(EXIT_EXIT)` |
| `StoreScreen` | `src/components/hud/StoreScreen.tsx` | 3 | Health, Energy, Weapon upgrades + Sell | `publish(HIDE_STORE)` |
| `SettingsScreen` | `src/components/hud/SettingsScreen.tsx` | 1 | Sound toggle, Music toggle, Vol sliders, Control mode, Exit/Back | `backToGame()` or `backToMenuCallback()` |
| `EndScreen` | `src/components/hud/EndScreen.tsx` | 2 | Climb Again, Back to Menu | — |

**SettingsScreen note:** Sliders need special handling — when a slider is focused, Left/Right adjusts the value instead of navigating.

---

## File Change Summary

### New Files
| File | Purpose |
|------|---------|
| `src/components/GamepadController.tsx` | Gamepad polling, movement + menu routing |
| `src/components/gamepad/GamepadNavigationContext.tsx` | Focus state management context |
| `src/hooks/useGamepadFocus.ts` | Per-screen registration hook |

### Modified Files
| File | Change |
|------|--------|
| `src/components/Game.tsx` | Mount `<GamepadController />`, wrap with `<GamepadNavigationProvider>` |
| `src/components/input/Button.tsx` | Add `gamepadFocused` prop + ring styling |
| `src/components/hud/Menu/MainScreen.tsx` | Register items + render highlight |
| `src/components/hud/Menu/Menu/PlayScreen.tsx` | Register items + render highlight |
| `src/components/hud/Menu/ScoresScreen.tsx` | Register items + render highlight |
| `src/components/hud/Menu/TutorialScreen.tsx` | Register items + render highlight |
| `src/components/hud/Embark/EmbarkScreen.tsx` | Register items + render highlight |
| `src/components/hud/Embark/ProvisionSelector.tsx` | Add `gamepadFocused` prop to cards |
| `src/components/hud/ExitOption.tsx` | Register items + render highlight |
| `src/components/hud/StoreScreen.tsx` | Register items + render highlight |
| `src/components/hud/SettingsScreen.tsx` | Register items + slider gamepad handling |
| `src/components/hud/EndScreen.tsx` | Register items + render highlight |

---

## Implementation Order (Suggested)

1. **`GamepadController.tsx`** — dungeon movement only (Part 1). Playable immediately.
2. **`GamepadNavigationContext` + `useGamepadFocus`** — the foundation.
3. **Extend `GamepadController`** — add menu mode routing.
4. **Update `Button.tsx`** — add `gamepadFocused` prop.
5. **Simple screens first:** `MainScreen`, `PlayScreen`, `EndScreen` — linear lists, easiest.
6. **Grid screens:** `ExitOption`, `StoreScreen`, `EmbarkScreen` — need gridCols.
7. **Complex screens:** `SettingsScreen` (sliders), `TutorialScreen` (page state).
8. **Wire everything into `Game.tsx`.**

---

## Key Reference Files (Do Not Modify, Read for Patterns)
- `src/components/CharacterController.tsx` — keyboard polling + publish pattern
- `src/components/DirectionalPads.tsx` — publish pattern (simplest example)
- `src/components/hud/MainMenu.tsx` — `pushToScreen`/`popScreen` stack pattern
- `src/components/types/EventTypes.tsx` — `PLAYER_ATTEMPT_MOVE`, `SHOW_STORE`, `HIDE_STORE`, etc.
- `src/components/types/GameTypes.tsx` — `Direction`, `GameStatus`, `Controls` enums
- `src/stores/stageSlice.ts` — `setShowStoreDialog`, `setShowSettingsDialog`, `setShowExitDialog`

---

## Verification Checklist

- [ ] Connect a standard gamepad (Xbox/PS)
- [ ] **Dungeon:** D-pad moves player one tile per press in correct direction
- [ ] **Dungeon:** Left stick moves player with ~200ms repeat delay
- [ ] **Dungeon:** A = wait, Y/Select = store, Start = settings
- [ ] **Dungeon:** No movement fires when `gameStatus !== GAME_STARTED`
- [ ] **Main menu:** D-pad navigates buttons, A activates, B goes back
- [ ] **EmbarkScreen:** D-pad navigates provision grid, A selects, A on Embark starts run
- [ ] **ExitOption:** Left/Right navigates 4 buttons, A activates
- [ ] **StoreScreen:** Left/Right navigates upgrade columns, A buys
- [ ] **SettingsScreen:** Up/Down navigates items, Left/Right adjusts sliders
- [ ] **EndScreen:** Left/Right navigates, A activates
- [ ] Gamepad highlight ring is visible and distinct from hover state
- [ ] No crashes when no gamepad is connected
