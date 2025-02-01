import fs from 'node:fs'
import { List } from 'immutable'

import * as tf from '@tensorflow/tfjs'

import { Centroids, fromEntries, toEntries, CentroidEntry } from '../../../discojs/src/msf/weights/centroids.js'

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
