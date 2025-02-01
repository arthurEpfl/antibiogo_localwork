import express from 'express'

import { CONFIG } from '../config.js'

import { antibiogo } from '../../../dicojs_mod/src/msf/task.js'

import { encodeCentroids, decodeCentroids } from '../../../dicojs_mod/src/msf/serialization/weights.js'

import { readFromCsv } from './centroids.js'

// export class Tasks {
//   private readonly ownRouter: express.Router

//   constructor () {
//     this.ownRouter = express.Router()

//     this.ownRouter.get(`/${msf.antibiogo.taskID}`, (_, res) => {
//       const centroids = centroid.readFromCsv(CONFIG.prototypicalPath)
//       msf.serialization.weights.encodeCentroids(centroids)
//         .then((encoded) => res.send(encoded))
//         .catch(console.error)
//     })
//   }

//   get router (): express.Router {
//     return this.ownRouter
//   }
// }


export class Tasks {
  private readonly ownRouter: express.Router;

  constructor() {
    this.ownRouter = express.Router();

    this.ownRouter.get(`/${antibiogo.taskID}`, async (_, res) => {
      try {
        const centroids = readFromCsv(CONFIG.prototypicalPath);
        console.log('Original Centroids:', centroids);

        const encoded = await encodeCentroids(centroids);
        console.log('Encoded Centroids:', encoded);

        const decoded = decodeCentroids(encoded);
        console.log('Decoded Centroids:', decoded);

        res.send(encoded);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });
  }

  public get router(): express.Router {
    return this.ownRouter;
  }
}
