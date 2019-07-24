/**
 * Represents two a dimensional array of elements of type E.
 */
export class Array2D<E> {
  protected data: E[];
  readonly height: number;
  readonly width: number;

  /**
   * Creates a Array2D whose (row,column)th entry is given by f(row,column).
   */
  static comprehension<E>(
    height: number,
    width: number,
    f: (row: number, col: number) => E
  ) {
    let arr = new Array2D<E>(height, width);
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        arr.set(r, c, f(r, c));
      }
    }
    return arr;
  }

  /**
   * Constructs a new Array2D with the given height and width. If a default
   * element is specified, then the array is filled with that element.
   */
  constructor(height: number, width: number, defaultElement?: E) {
    this.height = height;
    this.width = width;
    this.data = new Array(height * width);
    if (defaultElement != null) {
      this.data.fill(defaultElement);
    }
  }

  /** Sets the element of the array located at (row, column) to e */
  set(this: Array2D<E>, row: number, col: number, e: E): void {
    this.data[this.rc2ix(row, col)] = e;
  }

  /** Returns the element of the array located at (row, column) */
  get(this: Array2D<E>, row: number, col: number): E {
    return this.data[this.rc2ix(row, col)];
  }

  /** Returns a string representation of the array with one line for each row */
  toString(transform: (e: E) => string = e => e.toString()): string {
    let result = "";
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        result = result.concat(transform(this.get(row, col)), " ");
      }
      result = result.concat("\n");
    }
    return result;
  }

  inBounds(y: number, x: number) {
    return 0 <= y && y < this.height && 0 <= x && x < this.width;
  }

  /** Convert a row and coordinate into a linear index into the data array */
  protected rc2ix(this: Array2D<E>, row: number, column: number): number {
    return column * this.height + row;
  }

  /** Convert a linear index in the data array into a row and column */
  protected ix2rc(this: Array2D<E>, ix: number): { row: number; col: number } {
    const col = Math.floor(ix / this.height);
    const row = ix - col * this.height;
    return { row: row, col: col };
  }
}
