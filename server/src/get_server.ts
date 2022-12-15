import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import cors from 'cors'
import express from 'express'
import expressWS from 'express-ws'

import { CONFIG } from './config'
import { Router } from './router'
import axios from 'axios'

export class AntibiogoServer {
  private readonly _app: express.Application

  constructor () {
    this._app = express()
  }

  public get server (): express.Application {
    return this._app
  }

  serve (port?: number): http.Server {
    const wsApplier = expressWS(this.server, undefined, { leaveRouterUntouched: true })
    const app = wsApplier.app

    app.enable('trust proxy')
    app.use(cors())
    app.use(express.json({ limit: '50mb' }))
    app.use(express.urlencoded({ limit: '50mb', extended: false }))

    const baseRouter = new Router(wsApplier, CONFIG)
    app.use('/', baseRouter.router)

    const server = app.listen(port ?? CONFIG.serverPort, () => {
      console.log(`Disco Server listening on ${CONFIG.serverUrl.href}`)
    })

    return server
  }
}

export async function runAntibiogoServer (port?: number): Promise<http.Server> {
  const server = new AntibiogoServer()

  if (!fs.existsSync(CONFIG.prototypicalPath)) {
    fs.mkdirSync(path.dirname(CONFIG.prototypicalPath), { recursive: true })
    const response = await axios.get(CONFIG.prototypicalBucket)
    fs.writeFileSync(CONFIG.prototypicalPath, response.data)
  }

  return server.serve(port)
}
