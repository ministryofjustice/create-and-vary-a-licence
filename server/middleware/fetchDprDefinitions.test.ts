import { Request, Response } from 'express'
import DprService from '../services/dprService'
import fetchDprDefintions from './fetchDprDefinitions'
import { DprReportDefinition } from '../@types/dprReportingTypes'

jest.mock('../services/dprService')

const req = {} as Request
const res = { locals: {} } as unknown as Response
const next = jest.fn()

const dprDefinitions = [
  {
    id: '1',
    name: 'definition',
    description: 'This is a definition',
    variants: [
      {
        id: '1',
        name: 'report name 1',
        descrption: 'report description 1',
      },
    ],
    dashboards: 'N55A',
    authorised: true,
  },
] as unknown as DprReportDefinition[]

const dprService = new DprService(null) as jest.Mocked<DprService>

const middleware = fetchDprDefintions(dprService)

beforeEach(() => {
  res.locals.reportDefinitions = undefined
  dprService.getDefinitions.mockResolvedValue(dprDefinitions)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('fetchDprDefinitions', () => {
  it('should populate definitions from the API', async () => {
    expect(res.locals.reportDefinitions).toBeUndefined()
    await middleware(req, res, next)
    expect(res.locals.reportDefinitions).toEqual(dprDefinitions)
    expect(dprService.getDefinitions).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should handle error from dpr service', async () => {
    dprService.getDefinitions.mockRejectedValue('Error')
    await middleware(req, res, next)
    expect(next).toHaveBeenCalledWith('Error')
  })
})
