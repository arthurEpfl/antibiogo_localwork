import fs from 'node:fs'
import { List } from 'immutable'

import { tf, WeightsContainer } from '@epfml/discojs-node'

export type CentroidEntry = [tf.Tensor, number, number, string]

export class Centroids {
  constructor (
    private readonly _positions: WeightsContainer,
    private readonly _radius: number[],
    private readonly _counts: number[],
    private readonly _labels: string[]
  ) {
    console.log(_positions, _radius, _counts, _labels)
    if (![_radius, _counts, _labels].every((e) =>
      e.length === _positions.weights.length)) {
      throw new Error('Given collections differ in length')
    }
  }

  get positions (): WeightsContainer {
    return this._positions
  }

  get radius (): number[] {
    return this._radius
  }

  get counts (): number[] {
    return this._counts
  }

  get labels (): string[] {
    return this._labels
  }
}

export function fromEntries (entries: List<CentroidEntry>): Centroids {
  return new Centroids(
    new WeightsContainer(entries.map((e) => e[0])),
    entries.map((e) => e[1]).toArray(),
    entries.map((e) => e[2]).toArray(),
    entries.map((e) => e[3]).toArray()
  )
}

export function toEntries (centroids: Centroids): List<CentroidEntry> {
  return List(centroids.positions.weights).zip(
    List(centroids.radius),
    List(centroids.counts),
    List(centroids.labels)
  ) as List<CentroidEntry>
}

export function readFromCsv (path: string): Centroids {
  if (!fs.existsSync(path)) {
    throw new Error('Prototypical model file is missing')
  }
  const raw = fs.readFileSync(path)
  const entries = raw.toString().split('\n')
    .map((line) => {
      const [label, radius, count, vector] = line.split(',')
      const position = tf.tensor(vector.split('&').map(Number))
      return [position, Number(radius), Number(count), label] as CentroidEntry
    })
  return fromEntries(List(entries))
}

export function writeToCsv (path: string, centroids: Centroids): void {
  const entries = toEntries(centroids)
  const data = entries.map(([p, r, c, l]) => {
    const centroidVector = (p.arraySync() as number[])
      .map(String)
      .join('&')
    return [l, r, c, centroidVector].join(',')
  }).valueSeq().toList().join('\n')

  fs.writeFile(path, data, console.error)
}
