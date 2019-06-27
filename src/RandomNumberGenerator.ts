export interface RandomNumberGenerator {
  // Returns a uniformly random number in [0,1)
  next(): number;
}

/**
 * Implementation of a simple Linear Congruential Generator. Parameters are
 * taken from Numerical Recipes (Press, Teukolsky, Vetterling, Flannery, 2007).
 */
export class LCG implements RandomNumberGenerator {
  constructor(private seed: number) {}

  next(): number {
    // LCG parameters
    const m = 2147483648; // = 2^32
    const a = 1664525;
    const c = 1013904223;
    // Update the seed
    this.seed = (this.seed * a + c) % m;
    // Return the current seed rescaled to [0,1)
    return this.seed / m;
  }
}
