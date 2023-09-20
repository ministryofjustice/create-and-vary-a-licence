import config from '../config'
import RestClient from './hmppsRestClient'
import { TokenStore } from './tokenStore'

export interface Component {
  html: string
  css: string[]
  javascript: string[]
}

export type AvailableComponent = 'header' | 'footer'

export default class FeComponentsClient extends RestClient {
  constructor(tokenStore: TokenStore) {
    super(tokenStore, 'HMPPS Components Client', config.apis.frontendComponents)
  }

  async getComponents<T extends AvailableComponent[]>(
    components: T,
    token: string
  ): Promise<Record<T[number], Component>> {
    return (await this.get({
      path: `/components?component=${components.join('&component=')}`,
      headers: { 'x-user-token': token },
    })) as Promise<Record<T[number], Component>>
  }
}
