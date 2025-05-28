import superagent, { SuperAgentRequest, Response } from 'superagent'

const url = 'http://localhost:9091/__admin'

const stubFor = (mapping: Record<string, unknown>): SuperAgentRequest =>
  superagent.post(`${url}/mappings`).send(mapping)

const getRequests = (): SuperAgentRequest => superagent.get(`${url}/requests`)

const resetStubs = (): Promise<Array<Response>> =>
  Promise.all([superagent.delete(`${url}/mappings`), superagent.delete(`${url}/requests`)])

const verifyEndpointCalled = async (options: { verb: string; path: string; times: number }): Promise<boolean> => {
  return superagent
    .post('http://localhost:9091/__admin/requests/count')
    .send({
      method: options.verb,
      url: options.path,
    })
    .then(response => response.body)
    .then(response => response.count === options.times)
    .then(success => {
      if (!success) throw new Error(`Endpoint called an unexpected number of times`)
      return success
    })
}

const verifyEndpointCalledWith = async (options: {
  verb: string
  path: string
  times: number
  param: string
  value: string
}): Promise<boolean> => {
  return superagent
    .post('http://localhost:9091/__admin/requests/find')
    .send({
      method: options.verb,
      urlPath: options.path,
    })
    .then(response => response.body.requests)
    .then((requests: Response[]) => {
      if (requests.length < 1) throw new Error(`No ${options.verb} requests made to ${options.path}`)
      return requests.filter(request => {
        const json = JSON.parse(request.body)
        return json[options.param] === options.value
      })
    })
    .then(requests => requests.length === options.times)
    .then(success => {
      if (!success)
        throw new Error(
          `${options.verb} request to ${options.path} with ${options.param} of ${options.value} was not called ${options.times} time(s)`,
        )
      return success
    })
}

export { stubFor, getRequests, resetStubs, verifyEndpointCalled, verifyEndpointCalledWith }
