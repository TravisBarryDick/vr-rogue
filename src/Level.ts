import { Array2D } from "./Array2D";

export enum Tile {
  Empty,
  Floor,
  Wall,
  Door
}

export function tile2char(t: Tile) {
  switch (t) {
    case Tile.Empty:
      return " ";
    case Tile.Floor:
      return ".";
    case Tile.Wall:
      return "#";
    case Tile.Door:
      return "=";
  }
}

export class Level {
  tiles: Array2D<Tile>;

  static LevelFromTiles(tiles: Array2D<Tile>) {
    let l = new Level(0,0);
    l.tiles = tiles;
    return l;
  }

  /** Constructs an empty level of the given width and height */
  constructor(height: number, width: number) {
    this.tiles = new Array2D<Tile>(height, width, Tile.Empty);
  }

  /** Returns a string representation of the level */
  toString(): string {
    return this.tiles.toString(tile2char);
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
