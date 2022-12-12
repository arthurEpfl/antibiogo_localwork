import express from 'express'
import expressWS from 'express-ws'

import { Config } from '../config'
import { AntibiogoFederated } from '../msf/router'
import { Tasks } from '../msf/tasks'

export class Router {
  private readonly ownRouter: expressWS.Router

  constructor (
    wsApplier: expressWS.Instance,
    private readonly config: Config
  ) {
    const antibiogo = new AntibiogoFederated(wsApplier)
    const tasks = new Tasks()

    this.ownRouter = express.Router()
    wsApplier.applyTo(this.ownRouter)

    process.nextTick(() =>
      wsApplier.getWss().on('connection', (ws, req) => {
        if (!antibiogo.isValidUrl(req.url)) {
          console.log('Connection refused')
          ws.terminate()
          ws.close()
        }
      })
    )

    this.ownRouter.get('/', (_, res, next) => {
      res.send('Server for DeAI & FeAI \n')
      next()
    })
    this.ownRouter.use('/antibiogo', antibiogo.router)
    this.ownRouter.use('/tasks', tasks.router)
  }

  get router (): express.Router {
    return this.ownRouter
  }
}
