import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceOverrideService from '../../../services/licenceOverrideService'
import LicencePrisonerDetailsRoutes from './licencePrisonerDetails'
import { Licence } from '../../../@types/licenceApiClientTypes'

jest.mock('../../../services/licenceService')
jest.mock('../../../services/licenceOverrideService')

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
const overrideService = new LicenceOverrideService(null) as jest.Mocked<LicenceOverrideService>

describe('Route handlers - Licence prisoner details override', () => {
  const handler = new LicencePrisonerDetailsRoutes(licenceService, overrideService)
  let req: Request
  let res: Response

  const licence = {
    id: 1,
    dateOfBirth: '01/01/1995',
  } as Licence

  beforeEach(() => {
    jest.resetAllMocks()
    res = {
      locals: {
        user: { username: 'bob' },
      },
      render: jest.fn(),
    } as unknown as Response
    req = {} as Request
  })

  describe('GET', () => {
    it('renders the prisoner details page with parsed DOB', async () => {
      req.params = { licenceId: '1' }
      licenceService.getLicence.mockResolvedValue(licence)

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/support/licencePrisonerDetails', {
        licence,
        dateOfBirth: { day: '01', month: '01', year: '1995' },
      })
    })
  })

  describe('POST', () => {
    it('updates prisoner details and re-renders page', async () => {
      req.params = { licenceId: '1' }
      licenceService.getLicence.mockResolvedValue(licence)

      req.body = {
        forename: 'foo',
        middleNames: 'fizz',
        surname: 'bar',
        dateOfBirth: { day: '25', month: '12', year: '1995' },
        reason: 'test',
      }

      await handler.POST(req, res)

      expect(overrideService.overrideLicencePrisonerDetails).toHaveBeenCalledWith(
        1,
        {
          forename: 'foo',
          middleNames: 'fizz',
          surname: 'bar',
          dateOfBirth: '25/12/1995',
          reason: 'test',
        },
        { username: 'bob' },
      )

      expect(res.render).toHaveBeenCalled()
    })
  })
})
