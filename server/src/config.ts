import path from 'path'

import { antibiogo } from './msf'

export class Config {
  public readonly serverUrl: URL

  constructor (
    // port to bind the server to
    public readonly serverPort: number,

    // File system saving scheme (URL-like).
    public readonly savingScheme: string,

    public readonly prototypicalPath: string,

    public readonly prototypicalBucket: string
  ) {
    const url = new URL('http://localhost')
    url.port = `${serverPort}`
    this.serverUrl = url
  }
}

const ROOT_DIR = path.join(__filename, '..', '..', '..')

export const CONFIG = new Config(
  8080,
  'file://',
  path.join(ROOT_DIR, 'server', 'models', antibiogo.taskID, 'model.csv'),
  'https://storage.googleapis.com/deai-313515.appspot.com/models/model.csv'
)
