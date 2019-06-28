import { RandomNumberGenerator } from "./RandomNumberGenerator";

export function randomChoice<T>(rng: RandomNumberGenerator, arr: Array<T>): T {
  let ix = Math.floor(rng.next() * arr.length);
  return arr[ix];
}

export function discreteSample(
  rng: RandomNumberGenerator,
  weights: Array<number>
): number {
  const totalWeight = weights.reduce((t, x) => t + x);
  const p = rng.next() * totalWeight;
  let acc = 0;
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i];
    if (acc >= p) return i;
  }
  return -1;
}
