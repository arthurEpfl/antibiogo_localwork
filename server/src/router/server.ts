import express from 'express'
import expressWS from 'express-ws'
import WebSocket from 'ws'

import { tf, Task } from '@epfml/discojs-node'

import { antibiogo } from '../msf'

export abstract class Server {
  private readonly ownRouter: expressWS.Router

  private readonly UUIDRegexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi

  constructor (wsApplier: expressWS.Instance) {
    this.ownRouter = express.Router()
    wsApplier.applyTo(this.ownRouter)

    this.ownRouter.get('/', (_, res) => res.send(this.description + '\n'))
  }

  public get router (): express.Router {
    return this.ownRouter
  }

  protected isValidTask (taskId: string): boolean {
    return taskId === antibiogo.taskID
  }

  protected isValidClientId (clientId: string): boolean {
    return new RegExp(this.UUIDRegexExp).test(clientId)
  }

  protected isValidWebSocket (urlEnd: string): boolean {
    return urlEnd === '.websocket'
  }

  public abstract isValidUrl (url: string | undefined): boolean

  protected abstract get description (): string

  protected abstract buildRoute (task: Task): string

  protected abstract initTask (task: Task, model: tf.LayersModel): void

  protected abstract handle (
    task: Task,
    ws: WebSocket,
    model: tf.LayersModel,
    req: express.Request,
  ): void
}
