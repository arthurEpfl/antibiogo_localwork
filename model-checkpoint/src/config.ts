export class Config {
  public readonly serverUrl: URL

  constructor (
    public readonly serverHost: string,
    public readonly serverPort: number
  ) {
    const url = new URL(`https://${serverHost}`)
    url.port = String(serverPort)
    this.serverUrl = url
  }
}

export const defaultConfig = new Config('localhost', 8080)
