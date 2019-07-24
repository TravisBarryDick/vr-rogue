import { PreDungeon } from "./PreDungeonGen";

/**
 * Returns the smallest positive number l such that (y,x) + l*dir is
 * floor adjacent. Returns Infinity if there is no floor adjacent tile along the
 * ray in direction dir starting at (y,x).
 */
export function hallrayLength(
  predungeon: PreDungeon,
  y: number,
  x: number,
  dir: { y: number; x: number }
): number {
  let length = 0;
  while (predungeon.inBounds(y, x)) {
    if (predungeon.isFloorAdjacent(y, x)) return length;
    length += 1;
    y += dir.y;
    x += dir.x;
  }
  return Infinity;
}

/**
 * Returns true if placing a hallray in direction dir starting from (y,x)
 * connects to a floor after placing at most maxLength floor tiles.
 */
export function isValidHallray(
  predungeon: PreDungeon,
  y: number,
  x: number,
  dir: { y: number; x: number },
  maxLength: number
) {
  return hallrayLength(predungeon, y, x, dir) < maxLength;
}

/**
 * Places floor tiles between (y,x) and (y,x) + length*dir, inclusively.
 */
export function placeHallray(
  predungeon: PreDungeon,
  y: number,
  x: number,
  dir: { y: number; x: number },
  length: number
) {
  for (let step = 0; step <= length; step++) {
    predungeon.setFloor(y, x);
    y += dir.y;
    x += dir.x;
  }
}
