import { RandomNumberGenerator } from "./RandomNumberGenerator";

export function randomChoice<T>(rng: RandomNumberGenerator, arr: Array<T>): T {
  let ix = Math.floor(rng.next() * arr.length);
  return arr[ix];
}

/**
 * A helper class for representing rectangles and enumerating the coordintaes
 * belonging to it.
 */
export class Rectangle {
  constructor(
    readonly y: number,
    readonly x: number,
    readonly height: number,
    readonly width: number
  ) {}

  /**
   * Returns a new rectangle whose height and width has been enlarged by the
   * given amounts. 
   */
  enlarge(heightDelta: number, widthDelta: number) {
    const new_y = this.y - Math.floor(heightDelta / 2);
    const new_x = this.x - Math.floor(widthDelta / 2);
    const new_height = this.height + heightDelta;
    const new_width = this.width + widthDelta;
    return new Rectangle(new_y, new_x, new_height, new_width);
  }

  /**
   * Yields the coordinates belonging to the rectangle in row major order
   * starting from the top left corner
   */
  *areaCoords() {
    let coord = { y: 0, x: 0 };
    for (coord.y = this.y; coord.y < this.y + this.height; coord.y++) {
      for (coord.x = this.x; coord.x < this.x + this.width; coord.x++) {
        yield coord;
      }
    }
  }

  /**
   * Yields the coordinates on the perimeter of the rectangle in clockwise
   * order, starting with the upper left corner. Skips the first and last `skip`
   * many coordinates on each edge
   */
  *perimeterCoords(skip: number = 0) {
    const miny = this.y;
    const maxy = this.y + this.height - 1;
    const minx = this.x;
    const maxx = this.x + this.width - 1;
    let coord = { y: 0, x: 0 };
    // Top edge
    coord.y = miny;
    for (coord.x = minx + skip; coord.x <= maxx - skip; coord.x++) yield coord;
    // Right edge
    coord.x = maxx;
    for (coord.y = miny + skip; coord.y <= maxy - skip; coord.y++) yield coord;
    // Bottom edge
    coord.y = maxy;
    for (coord.x = maxx - skip; coord.x >= minx + skip; coord.x--) yield coord;
    // Left edge
    coord.x = minx;
    for (coord.y = maxy - skip; coord.y >= miny + skip; coord.y--) yield coord;
  }
}
