import superagent, { SuperAgentRequest, Response } from 'superagent'

const url = 'http://localhost:9091/__admin'

type Mapping = Record<string, unknown>

// While a batch is open, stubFor collects mappings instead of posting them one by one
let batch: Mapping[] | null = null

const stubFor = (mapping: Mapping): SuperAgentRequest => {
  if (batch) {
    batch.push(mapping)
    return Promise.resolve(null) as unknown as SuperAgentRequest
  }
  return superagent.post(`${url}/mappings`).send(mapping)
}

// Runs stub functions synchronously, collecting every mapping they create and returning them in call order
const collectStubs = (stubs: () => unknown): Mapping[] => {
  batch = []
  try {
    stubs()
    return batch
  } finally {
    batch = null
  }
}

// Wiremock gives the first mapping in an import priority, so reverse to keep "last stub wins" like individual posts
const importStubs = (mappings: Mapping[], replaceExisting = false) =>
  superagent.post(`${url}/mappings/import`).send({
    mappings: [...mappings].reverse(),
    importOptions: { duplicatePolicy: 'IGNORE', deleteAllNotInImport: replaceExisting },
  })

const getRequests = (): SuperAgentRequest => superagent.get(`${url}/requests`)

const findRequests = (pattern: Record<string, unknown>): SuperAgentRequest =>
  superagent.post(`${url}/requests/find`).send(pattern)

// Replaces all mappings with the given ones and clears the request journal in two parallel calls
const resetStubs = (baseline: Mapping[]): Promise<Array<Response>> =>
  Promise.all([importStubs(baseline, true), superagent.delete(`${url}/requests`)])

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

export {
  findRequests,
  stubFor,
  collectStubs,
  importStubs,
  getRequests,
  resetStubs,
  verifyEndpointCalled,
  verifyEndpointCalledWith,
}
