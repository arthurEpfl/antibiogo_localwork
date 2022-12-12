import express from 'express'

import { CONFIG } from '../config'
import { serialization, centroid, antibiogo } from '.'

export class Tasks {
  private readonly ownRouter: express.Router

  constructor () {
    this.ownRouter = express.Router()

    this.ownRouter.get(`/${antibiogo.taskID}`, (_, res) => {
      const centroids = centroid.readFromCsv(CONFIG.prototypicalPath)
      void serialization.encodeCentroids(centroids).then((r) => res.send(r))
    })
  }

  get router (): express.Router {
    return this.ownRouter
  }
}
