import logger from '../../logger'
import type { RedisClient } from './redisClient'
import type { SystemTokenSupplier } from './systemToken'

export abstract class TokenStore {
  constructor(private readonly systemTokenSupplier: SystemTokenSupplier) {}

  abstract setToken(key: string, token: string, durationSeconds: number): Promise<void>

  abstract getToken(key: string): Promise<string>

  public getSystemToken = async (username?: string): Promise<string> => {
    const key = username || '%ANONYMOUS%'
    const token = await this.getToken(key)
    if (token) {
      return token
    }

    const systemToken = await this.systemTokenSupplier(username)
    await this.setToken(key, systemToken.token, systemToken.expiresIn - 60)
    return systemToken.token
  }
}

export class RedisTokenStore extends TokenStore {
  private readonly prefix = 'systemToken:'

  constructor(systemTokenSupplier: SystemTokenSupplier, private readonly client: RedisClient) {
    super(systemTokenSupplier)
    client.on('error', error => {
      logger.error(error, `Redis error`)
    })
  }

  private async ensureConnected() {
    if (!this.client.isOpen) {
      await this.client.connect()
    }
  }

  public async setToken(key: string, token: string, durationSeconds: number): Promise<void> {
    await this.ensureConnected()
    await this.client.setEx(`${this.prefix}${key}`, durationSeconds, token)
  }

  public async getToken(key: string): Promise<string> {
    await this.ensureConnected()
    return this.client.get(`${this.prefix}${key}`)
  }
}

export class InMemoryTokenStore extends TokenStore {
  constructor(systemTokenSupplier: SystemTokenSupplier, private readonly tokenMap: Map<string, string> = new Map()) {
    super(systemTokenSupplier)
  }

  public async setToken(key: string, token: string): Promise<void> {
    this.tokenMap.set(key, token)
  }

  public async getToken(key: string): Promise<string> {
    return this.tokenMap.get(key)
  }
}
