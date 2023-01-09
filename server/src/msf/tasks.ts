import express from 'express'

import { CONFIG } from '../config'
import { serialization, msf } from 'epfl-antibiogo-lib'
import { centroid } from '.'

export class Tasks {
  private readonly ownRouter: express.Router

  constructor () {
    this.ownRouter = express.Router()

    this.ownRouter.get(`/${msf.antibiogo.taskID}`, (_, res) => {
      const centroids = centroid.readFromCsv(CONFIG.prototypicalPath)
      serialization.weights.encodeCentroids(centroids)
        .then((encoded) => res.send(encoded))
        .catch(console.error)
    })
  }

  get router (): express.Router {
    return this.ownRouter
  }
}
