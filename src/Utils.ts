import { RandomNumberGenerator } from "./RandomNumberGenerator";

export function randomChoice<T>(rng: RandomNumberGenerator, arr: Array<T>): T {
  let ix = Math.floor(rng.next() * arr.length);
  return arr[ix];
}

export function* rectAreaCoords(
  y: number,
  x: number,
  height: number,
  width: number
) {
  let result = { y: 0, x: 0 };
  for (result.y = y; result.y < y + height; result.y++) {
    for (result.x = x; result.x < x + width; result.x++) {
      yield result;
    }
  }
}

/**
 * Yields the coordinates on the perimeter of a rectangle in clockwise order,
 * starting with the upper left corner. Skips the first and last `skip` many
 * coordinates on each edge.
 */
export function* rectPerimeterCoords(
  y: number,
  x: number,
  height: number,
  width: number,
  skip: number = 0
) {
  let result = { y: 0, x: 0 };
  // Top edge
  result.y = y;
  for (result.x = x + skip; result.x < x + width - skip; result.x++)
    yield result;
  // Right edge
  result.x = x + width - 1;
  for (result.y = y + skip; result.y < y + height - skip; result.y++)
    yield result;
  // Bottom edge
  result.y = y + height - 1;
  for (result.x = x + width - 1 - skip; result.x >= x + skip; result.x--)
    yield result;
  // Left edge
  result.x = x;
  for (result.y = y + height - 1 - skip; result.y >= y + skip; result.y--)
    yield result;
}
