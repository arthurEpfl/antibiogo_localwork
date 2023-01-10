import express from 'express'
import WebSocket from 'ws'
import msgpack from 'msgpack-lite'
import { List, Map, Set } from 'immutable'
import expressWs = require('express-ws')

import {
  client,
  AsyncInformant,
  TaskID,
  AsyncBuffer,
  aggregation,
  msf
} from 'epfl-antibiogo-lib'

import { CentroidEntry, readFromCsv, writeToCsv, fromEntries, toEntries } from './centroids'
import messages = client.federated.messages
import messageTypes = client.messages.type
import clientConnected = client.messages.type.clientConnected
import { CONFIG } from '../config'

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

  private readonly UUIDRegexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi

  private aggregationLock = false

  constructor (wsApplier: expressWs.Instance) {
    this.ownRouter = express.Router()
    wsApplier.applyTo(this.ownRouter)

    this.initTask()

    this.ownRouter.get('/trigger-aggregation', async (_, res) => {
      
      if (this.asyncBuffer === undefined) {
        throw new Error('asyncBuffer is undefined, task not initialized')
      }

      if (this.aggregationLock === true) {
        res.status(503).send('Aggregation already in progress\n')
        return
      }


      this.aggregationLock = true
      try {
        await this.asyncBuffer.updateWeights()
      } catch (e) {
        console.error(e)
        
        // release the lock if an error occurs
        this.aggregationLock = false

        res.status(500).send('Error while aggregating\n')
        return
      }
      
      res.status(200).send('Aggregation successful\n')



      this.aggregationLock = false
    })

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

  protected initTask (): void {
    this.tasksStatus = this.tasksStatus.set(msf.antibiogo.taskID, {
      isRoundPending: false,
      round: 0
    })

    this.centroids = readFromCsv(CONFIG.prototypicalPath)

    const isByzantineRobust: boolean = msf.antibiogo.trainingInformation?.byzantineRobustAggregator ?? false
    const tauPercentile: number = msf.antibiogo.trainingInformation?.tauPercentile ?? 0

    const buffer = new AsyncBuffer<msf.Centroids>(
      msf.antibiogo.taskID,
      async (centroids: Iterable<msf.Centroids>) =>
        await this.aggregateAndStoreCentroids(List(centroids), isByzantineRobust, tauPercentile)
    )
    this.asyncBuffer = buffer

    this.asyncInformant = new AsyncInformant(buffer)
  }

  public get router (): express.Router {
    return this.ownRouter
  }

  // Current state of centroids on the server
  private centroids!: msf.Centroids

  // model weights received from clients for a given task and round.
  private asyncBuffer!: AsyncBuffer<msf.Centroids>
  // informants for each task.
  private asyncInformant!: AsyncInformant<msf.Centroids>
  /**
   * Contains metadata used for training by clients for a given task and round.
   * Stored by task ID, round number and client ID.
   */
  private metadataMap = Map<number, Map<string, Map<string, string>>>()

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
    return '/:clientId'
  }

  public isValidUrl (url: string | undefined): boolean {
    const splittedUrl = url?.split('/')

    return (splittedUrl !== undefined && splittedUrl.length === 3 && splittedUrl[0] === '' &&
      this.isValidClientId(splittedUrl[1]) &&
      this.isValidWebSocket(splittedUrl[2]))
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
        const rawWeights = msg.weights
        const round = msg.round

        this.logsAppend(
          clientId,
          RequestType.PostAsyncWeights,
          round
        )

        if (!(
          Array.isArray(rawWeights) &&
          rawWeights.every((e) => typeof e === 'number')
        )) {
          throw new Error('invalid weights format')
        }

        const centroids: msf.Centroids = msf.serialization.weights.decodeCentroids(rawWeights) // in this case weights is a SerializedCentroids object

        console.log(
          'received centroids from client', clientId,
          'for round', round,
          'centroids: positions=', centroids.positions.weights[0].dataSync(),
          'counters=', centroids.counts,
          'radius=', centroids.radius
        )

        const buffer = this.asyncBuffer
        if (buffer === undefined) {
          throw new Error('post weight to unknown task:\'antibiogo\'')
        }

        buffer.add(clientId, centroids, round)
        console.info('added centroids from client', clientId, 'to buffer, current buffer size:', buffer.buffer.size)
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
          throw new Error(`get round of unknown task: ${msf.antibiogo.taskID}`)
        }

        // Get latest round
        const round = buffer.round

        this.logsAppend(clientId, RequestType.GetAsyncRound, 0)

        void msf.serialization.weights.encodeCentroids(this.centroids).then((serializedWeights) => {
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

  private async aggregateAndStoreCentroids (
    centroids: List<msf.Centroids>,
    byzantineRobustAggregator: boolean,
    tauPercentile: number
  ): Promise<void> {
    if (!centroids.every((centroid) =>
      centroid.positions.weights[0].shape[0] === this.centroids.positions.weights[0].shape[0])) {
      throw new Error('Centroid positions shape mismatch')
    }
    if (!centroids.every((centroid) => centroid.counts.length >= this.centroids.counts.length)) {
      throw new Error('Centroids counts length mismatch')
    }

    // Handle updated centroids with known labels
    const knownCentroids = centroids
      .map((clientCentroids) => toEntries(clientCentroids)
        .take(this.centroids.labels.length))
      .filter((es) => es
        .zip(List(this.centroids.labels))
        .every(([e, l]) => e[3] === l))

    const knownPositions = knownCentroids.map((clientCentroids) =>
      clientCentroids.map((e) => e[0]))

    const averagedPositions = byzantineRobustAggregator && tauPercentile > 0 && tauPercentile < 1
      ? aggregation.avgClippingWeights(knownPositions, this.centroids.positions, tauPercentile)
      : aggregation.avg(knownPositions)

    const knownCounts = knownCentroids.map((clientCentroids) =>
      clientCentroids.map((e, idx) =>
        e[2] - this.centroids.counts[idx]))
      .reduce((acc: number[], counts) =>
        acc.map((count, idx) =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          count + counts.get(idx)!),
      this.centroids.counts)

    const updatedCentroids = toEntries(new msf.Centroids(
      averagedPositions,
      this.centroids.radius,
      knownCounts,
      this.centroids.labels
    ))

    // Handle new labels
    const unknownCentroids = centroids
      .map((clientCentroids) => toEntries(clientCentroids)
        .slice(this.centroids.labels.length))
      .filter((e) => e.size > 0)

    if (unknownCentroids.size === 0) {
      // Reorder everything by label and update model
      this.centroids = fromEntries(updatedCentroids)
    } else {
      const perLabel = unknownCentroids.flatMap((e) => e).groupBy((e) => e[3])
      const newCentroids = perLabel
        .map((es) => {
          const [p, r, c, l]: CentroidEntry = es.reduce((acc: CentroidEntry, e) => [
            acc[0].add(e[0]),
            acc[1] + e[1],
            acc[2] + e[2],
            acc[3]
          ])
          const size = es.count()
          return [p.div(size), r / size, c, l] as CentroidEntry
        })
        .toList()

      // Reorder everything by label and update model
      this.centroids = fromEntries(updatedCentroids.concat(newCentroids).sortBy((e) => e[3]))
    }

    // Save to local file system
    writeToCsv(CONFIG.prototypicalPath, this.centroids)
  }

  /**
   * Appends the given request to the server logs.
   * @param clientId
   * @param type
   * @param round
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
      task: msf.antibiogo.taskID,
      round,
      client: clientId,
      request: type
    })
  }
}
