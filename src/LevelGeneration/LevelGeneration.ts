import { Array2D } from "../Array2D";
import { Level, Tile, tile2char } from "../Level";
import { RandomNumberGenerator } from "../RandomNumberGenerator";
import { discreteSample, randomChoice } from "../Utils";

//////////////////
// --- Room --- //
//////////////////

export interface Room {
  height(): number;
  width(): number;
  canPlaceAt(tiles: Array2D<Tile>, y: number, x: number): boolean;
  placeAt(
    rng: RandomNumberGenerator,
    tiles: Array2D<Tile>,
    y: number,
    x: number
  ): void;
}

export interface RoomGen {
  (rng: RandomNumberGenerator): Room;
}

/////////////////////////////
// --- Level Generator --- //
/////////////////////////////

export class LevelGenerator {
  constructor(
    private height: number,
    private width: number,
    private maxRooms: number,
    private roomGens: Array<RoomGen>,
    private weights?: Array<number>
  ) {
    // If weights were not provided, give rooms equal weight
    if (weights == null) {
      this.weights = roomGens.map(() => 1.0);
    }
  }

  private chooseRoom(rng: RandomNumberGenerator): Room {
    const ix = discreteSample(rng, this.weights);
    return this.roomGens[ix](rng);
  }

  /**
   * Generates a random level.
   */
  generate(
    this: LevelGenerator,
    rng: RandomNumberGenerator,
    verbose: boolean = false
  ): Level {
    let tiles = new Array2D<Tile>(this.height, this.width, Tile.Empty);
    let room = this.chooseRoom(rng);
    this.addRoom(rng, tiles, room, true);
    if (verbose) {
      console.log("Room 0:\n");
      console.log(tiles.toString(tile2char));
    }
    for (let i = 0; i < this.maxRooms; i++) {
      let room = this.chooseRoom(rng);
      this.addRoom(rng, tiles, room);
      if (verbose) {
        console.log(`Room ${i + 1}:\n`);
        console.log(tiles.toString(tile2char));
      }
    }
    return Level.LevelFromTiles(tiles);
  }

  /**
   * Attempts to place the room `r` in the level by considering all possible
   * positions. Returns true if the room was placed and false if there were no
   * valid positions. If there are multiple valid positions, places the room at
   * a randomly chosen valid position.
   */
  private addRoom(
    rng: RandomNumberGenerator,
    tiles: Array2D<Tile>,
    r: Room,
    forceValid: boolean = false
  ): boolean {
    // Find all positions where the room can be placed
    let validPositions = new Array<[number, number]>();
    for (let y = 0; y + r.height() < tiles.height; y++) {
      for (let x = 0; x + r.width() < tiles.width; x++) {
        if (forceValid || r.canPlaceAt(tiles, y, x)) {
          validPositions.push([y, x]);
        }
      }
    }
    // If there were no valid room positions, return false.
    if (validPositions.length === 0) {
      return false;
    }
    // Otherwise, choose a valid position and place the room there.
    let [y, x] = randomChoice(rng, validPositions);
    r.placeAt(rng, tiles, y, x);
    return true;
  }
}

//////////////////////////////
// --- Helper Functions --- //
//////////////////////////////

export function isValidDoor(
  tiles: Array2D<Tile>,
  y: number,
  x: number
): boolean {
  if (y > 0 && tiles.get(y - 1, x) === Tile.Floor) return true;
  if (y < tiles.height - 1 && tiles.get(y + 1, x) === Tile.Floor) return true;
  if (x > 0 && tiles.get(y, x - 1) === Tile.Floor) return true;
  if (x < tiles.width - 1 && tiles.get(y, x + 1) === Tile.Floor) return true;
  return false;
}
