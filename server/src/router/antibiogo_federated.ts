import express from 'express'
import WebSocket from 'ws'

import { List, Map, Set } from 'immutable'
import { antibiogo } from './antibiogo_task'
import msgpack from 'msgpack-lite'

import {
  client,
  tf,
  serialization,
  aggregation,
  AsyncInformant,
  Task,
  TaskID,
  AsyncBuffer,
  WeightsContainer
} from '@epfml/discojs-node'

import messages = client.federated.messages
import messageTypes = client.messages.type
import clientConnected = client.messages.type.clientConnected
import expressWs = require('express-ws')
import { Centroids } from '../discojs-lib/centroids'
import { decodeCentroids, encodeCentroids } from '../discojs-lib/serialization'

const BUFFER_CAPACITY = 1 // We aggregate centroids directly

enum RequestType {
  Connect,
  Disconnect,

  PostAsyncWeights,

  GetMetadata,
  PostMetadata,

  GetAsyncRound,
}

interface Log {
  // a timestamp corresponding to the time at which the request was made
  timestamp: Date
  // the task ID for which the request was made
  task: TaskID
  // the round at which the request was made
  round: number
  // the client ID used to make the request
  client: string
  // the request type
  request: RequestType
}

interface TaskStatus {
  isRoundPending: boolean
  round: number
}

export class AntibiogoFederated {
  private readonly ownRouter: expressWs.Router

  private readonly tasks: string[] = new Array<string>()
  private readonly UUIDRegexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi

  constructor (wsApplier: expressWs.Instance) {
    this.ownRouter = express.Router()
    wsApplier.applyTo(this.ownRouter)

    this.initTask(new Centroids(WeightsContainer.of([0]), [0], [0])) // TODO: setup initial centroid on server?

    this.ownRouter.get('/', (_, res) => res.send(this.description + '\n'))

    this.ownRouter.ws(this.buildRoute(), (ws, req) => {
      if (this.isValidUrl(req.url)) {
        this.handle(ws, req)
      } else {
        ws.terminate()
        ws.close()
      }
    })
  }

  protected initTask (initialCentroids: Centroids): void {
    this.tasksStatus = this.tasksStatus.set(antibiogo.taskID, {
      isRoundPending: false,
      round: 0
    })

    const isByzantineRobust: boolean = antibiogo.trainingInformation?.byzantineRobustAggregator ?? false
    const tauPercentile: number = antibiogo.trainingInformation?.tauPercentile ?? 0

    const buffer = new AsyncBuffer<Centroids>(
      antibiogo.taskID,
      BUFFER_CAPACITY,
      async (centroids: Iterable<Centroids>) =>
        await this.aggregateAndStoreCentroids(List(centroids), isByzantineRobust, tauPercentile)
    )
    this.asyncBuffer = buffer

    this.asyncInformant = new AsyncInformant(buffer)

    this.centroids = initialCentroids
  }

  public get router (): express.Router {
    return this.ownRouter
  }

  // Current state of centroids on the server 
  private centroids!: Centroids

  // model weights received from clients for a given task and round.
  private asyncBuffer!: AsyncBuffer<Centroids>
  // informants for each task.
  private asyncInformant!: AsyncInformant<Centroids>
  /**
   * Contains metadata used for training by clients for a given task and round.
   * Stored by task ID, round number and client ID.
   */
  private metadataMap =
  Map<number, Map<string, Map<string, string>>>
  ()

  // Contains all successful requests made to the server.
  // TODO use real log system
  private logs = List<Log>()

  // Contains client IDs currently connected to one of the server.
  private clients = Set<string>()

  /**
   * Maps a task to a status object. Currently provides the round number and
   * round status for each task.
   */
  private tasksStatus = Map<TaskID, TaskStatus>()

  protected get description (): string {
    return 'Antibiogo FeAI Server'
  }

  protected buildRoute (): string {
    return `/antibiogo-feai/:clientId`
  }

  public isValidUrl (url: string | undefined): boolean {
    const splittedUrl = url?.split('/')

    return (splittedUrl !== undefined && splittedUrl.length === 4 && splittedUrl[0] === '' &&
      this.isValidClientId(splittedUrl[2]) &&
      this.isValidWebSocket(splittedUrl[3]))
  }

  protected isValidClientId (clientId: string): boolean {
    return new RegExp(this.UUIDRegexExp).test(clientId)
  }

  protected isValidWebSocket (urlEnd: string): boolean {
    return urlEnd === '.websocket'
  }


  protected sendConnectedMsg (ws: WebSocket): void {
    const msg: messages.messageGeneral = { type: clientConnected }
    ws.send(msgpack.encode(msg))
  }

  protected handle (
    ws: WebSocket,
    req: express.Request
  ): void {
    const clientId = req.params.clientId

    ws.on('message', (data: Buffer) => {
      const msg = msgpack.decode(data)
      if (msg.type === clientConnected) {
        console.info('client', clientId, 'joined antibiogo task')

        this.clients = this.clients.add(clientId)

        this.logsAppend(clientId, RequestType.Connect, 0)
        this.sendConnectedMsg(ws)
      } else if (msg.type === messageTypes.postWeightsToServer) {
        const rawWeights = msg.weights.positions
        const round = msg.round

        this.logsAppend(
          clientId,
          RequestType.PostAsyncWeights,
          round
        )

        if (
          !(
            Array.isArray(rawWeights) &&
            rawWeights.every((e) => typeof e === 'number')
          )
        ) {
          throw new Error('invalid weights format')
        }

        const centroids: Centroids = decodeCentroids(msg.weights)  // in this case weights is a SerializedCentroids object

        const buffer = this.asyncBuffer
        if (buffer === undefined) {
          throw new Error(`post weight to unknown task:'antibiogo'`)
        }

        void buffer.add(clientId, centroids, round)
      } else if (msg.type === messageTypes.pullServerStatistics) {
        // Get latest round
        const statistics = this.asyncInformant.getAllStatistics()

        const msg: messages.pullServerStatistics = {
          type: messageTypes.pullServerStatistics,
          statistics: statistics ?? {}
        }

        ws.send(msgpack.encode(msg))
      } else if (msg.type === messageTypes.latestServerRound) {
        const buffer = this.asyncBuffer
        if (buffer === undefined) {
          throw new Error(`get round of unknown task: ${antibiogo.taskID}`)
        }

        // Get latest round
        const round = buffer.round

        this.logsAppend(clientId, RequestType.GetAsyncRound, 0)

        void encodeCentroids(this.centroids).then((serializedWeights) => {
          const msg: messages.latestServerRound = {
            type: messageTypes.latestServerRound,
            round: round,
            weights: serializedWeights // in this case weights is a SerializedCentroids object
          }

          ws.send(msgpack.encode(msg))
        })
      } else if (msg.type === messageTypes.postMetadata) {
        const round = msg.round

        const metadataId = msg.metadataId
        const metadata = msg.metadata

        this.logsAppend(clientId, RequestType.PostMetadata, round)

        if (
          this.metadataMap.hasIn([round, clientId, metadataId])
        ) {
          throw new Error('metadata already set')
        }
        this.metadataMap = this.metadataMap.setIn(
          [round, clientId, metadataId],
          metadata
        )
      } else if (msg.type === messageTypes.getMetadataMap) {
        const metadataId = msg.metadataId
        const round = Number.parseInt(msg.round, 0)

        if (!Number.isNaN(round) && round >= 0 && this.metadataMap !== undefined) {
          /**
           * Find the most recent entry round-wise for the given task (upper bounded
           * by the given round). Allows for sporadic entries in the metadata map.
           */
          const latestRound = this.metadataMap.keySeq().max() ?? round

          /**
           * Fetch the required metadata from the general metadata structure stored
           * server-side and construct the queried metadata's map accordingly. This
           * essentially creates a "ID -> metadata" single-layer map.
           */
          const queriedMetadataMap = Map(
            this.metadataMap
              .get(latestRound, Map<string, Map<string, string>>())
              .filter((entries) => entries.has(metadataId))
              .mapEntries(([id, entries]) => [id, entries.get(metadataId)])
          )

          this.logsAppend(clientId, RequestType.GetMetadata, round)

          const msg: messages.getMetadataMap = {
            type: messageTypes.getMetadataMap,
            clientId: clientId,
            taskId: 'antibiogo',
            metadataId: metadataId,
            round: round,
            metadataMap: Array.from(queriedMetadataMap)
          }

          ws.send(msgpack.encode(msg))
        }
      }
    })
  }

  /**
   * Save the newly aggregated model to the server's local storage. This
   * is now the model served to clients for the given task. To save the newly
   * aggregated weights, here is the (cumbersome) procedure:
   * 1. create a new TF.js model with the right layers
   * 2. assign the newly aggregated weights to it
   * 3. save the model
   */
  private async aggregateAndStoreCentroids (
    centroids: List<Centroids>,
    byzantineRobustAggregator: boolean,
    tauPercentile: number
  ): Promise<void> {
    const centroidPositions: List<WeightsContainer> = centroids.map((centroid) => centroid.positions)

    // Get averaged centroids position
    const averagedPosition = byzantineRobustAggregator && tauPercentile > 0 && tauPercentile < 1
      ? aggregation.avgClippingWeights(centroidPositions, this.centroids.positions, tauPercentile)
      : aggregation.avg(centroidPositions)

    centroids.forEach((centroid) => {
      if (centroid.counters.length !== this.centroids.counters.length) {
        throw new Error('Centroids counters length mismatch') // Do not support different number of counters for now
      }
    })
    
    // There is probably a clearer/easier way to do this
    const updatedCounters = centroids.map(
      (centroid) => centroid.counters.map((count, index) => count - this.centroids.counters[index])) // difference between new and old counters
      .reduce((accumulator, counters) => accumulator.map((count, index) => count + counters[index]) , this.centroids.counters) // add all differences to existing centroids

    const updatedCentroids = new Centroids(averagedPosition, this.centroids.radius, updatedCounters)

    // Update model
    this.centroids = updatedCentroids
  }

  /**
   * Appends the given request to the server logs.
   * @param {Request} request received from client
   * @param {String} type of the request
   */
  private logsAppend (
    clientId: string,
    type: RequestType,
    round: number | undefined = undefined
  ): void {
    if (round === undefined) {
      return
    }

    this.logs = this.logs.push({
      timestamp: new Date(),
      task: antibiogo.taskID,
      round,
      client: clientId,
      request: type
    })
  }
}
