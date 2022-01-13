import superagent, { SuperAgentRequest, Response } from 'superagent'

const url = 'http://localhost:9091/__admin'

const stubFor = (mapping: Record<string, unknown>): SuperAgentRequest =>
  superagent.post(`${url}/mappings`).send(mapping)

const getRequests = (): SuperAgentRequest => superagent.get(`${url}/requests`)

const resetStubs = (): Promise<Array<Response>> =>
  Promise.all([superagent.delete(`${url}/mappings`), superagent.delete(`${url}/requests`)])

const verifyEndpointCalled = async (options: { verb: string; path: string; times: number }): Promise<boolean> => {
  // wait for wiremock to update the request counts
  await new Promise(resolve => setTimeout(resolve, 5000))
  return superagent
    .post('http://localhost:9091/__admin/requests/count')
    .send({
      method: options.verb,
      url: options.path,
    })
    .then(response => response.body)
    .then(response => response.count === options.times)
}

export { stubFor, getRequests, resetStubs, verifyEndpointCalled }
