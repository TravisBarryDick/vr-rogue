import { Array2D } from "./Array2D";
import { Tile } from "./Tile";

export class Level {
  tiles: Array2D<Tile>;

  static LevelFromTiles(tiles: Array2D<Tile>) {
    let l = new Level(0, 0);
    l.tiles = tiles;
    return l;
  }

  /** Constructs an empty level of the given width and height */
  constructor(height: number, width: number) {
    this.tiles = Array2D.comprehension<Tile>(height, width, () => new Tile());
  }

  /** Returns the width of the level */
  width(): number {
    return this.tiles.width;
  }

  /** Returns the height of the level */
  height(): number {
    return this.tiles.height;
  }
}
