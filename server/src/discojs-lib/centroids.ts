import {
    WeightsContainer
  } from '@epfml/discojs-node'

export class Centroids {
  private readonly _positions: WeightsContainer
  private readonly _radius: number[]
  private readonly _counters: number[]

  constructor (positions: WeightsContainer, radius: number[], counters: number[]) {
    this._positions = positions
    this._radius = radius
    this._counters = counters
  }

  get positions (): WeightsContainer {
    return this._positions
  }

  get radius (): number[] {
    return this._radius
  }

  get counters (): number[] {
    return this._counters
  }
}
