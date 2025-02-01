import path from 'path'

import { antibiogo } from '../../discojs/src/msf/task.js'

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

// const ROOT_DIR = path.join(__filename, '..', '..', '..')

import { fileURLToPath } from 'url';

// Convert `import.meta.url` to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..', '..', '..');

export const CONFIG = new Config(
  8080,
  'file://',
  path.join(ROOT_DIR, 'server', 'models', antibiogo.id, 'model.csv'),
  'https://storage.googleapis.com/deai-313515.appspot.com/models/model.csv'
)
