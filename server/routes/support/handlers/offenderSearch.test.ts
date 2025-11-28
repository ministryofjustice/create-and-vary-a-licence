import { Request, Response } from 'express'
import OffenderSearchRoutes from './offenderSearch'
import PrisonerService from '../../../services/prisonerService'
import ProbationService from '../../../services/probationService'
import { Prisoner } from '../../../@types/prisonerSearchApiClientTypes'

const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
const probationService = new ProbationService(null) as jest.Mocked<ProbationService>
jest.mock('../../../services/prisonerService')
jest.mock('../../../services/probationService')

describe('Route Handlers - Offender search', () => {
  const handler = new OffenderSearchRoutes(prisonerService, probationService)
  let req: Request
  let res: Response

  beforeEach(() => {
    res = {
      locals: {
        user: {},
      },
      render: jest.fn(),
    } as unknown as Response
    req = {} as Request
  })

  describe('GET', () => {
    it('Should render the correct view when search values are empty', async () => {
      req.query = {}

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/support/offenderSearch')
    })

    it('Should search by CRN', async () => {
      req.query = {
        crn: 'X1234',
      }

      probationService.getProbationer.mockResolvedValue({
        crn: 'X1234',
        nomisId: 'ABC123',
      })
      prisonerService.searchPrisoners.mockResolvedValue([
        {
          prisonerNumber: 'ABC123',
          prisonName: 'Pentonville',
          firstName: 'Test',
          lastName: 'Person',
        } as unknown as Prisoner,
      ])

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/support/offenderSearch', {
        searchResults: [{ crn: 'X1234', name: 'Test Person', nomisId: 'ABC123', prison: 'Pentonville' }],
        searchValues: { crn: 'X1234' },
      })
    })

    it('Should search by name and nomisId', async () => {
      req.query = {
        firstName: 'Test',
        lastName: 'Person',
        nomisId: 'ABC123',
      }

      prisonerService.searchPrisoners.mockResolvedValue([
        {
          prisonerNumber: 'ABC123',
          prisonName: 'Pentonville',
          firstName: 'Test',
          lastName: 'Person',
        } as unknown as Prisoner,
      ])
      probationService.getProbationers.mockResolvedValue([
        {
          crn: 'X1234',
          nomisId: 'ABC123',
        },
      ])

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/support/offenderSearch', {
        searchResults: [{ crn: 'X1234', name: 'Test Person', nomisId: 'ABC123', prison: 'Pentonville' }],
        searchValues: {
          firstName: 'Test',
          lastName: 'Person',
          nomisId: 'ABC123',
        },
      })
    })

    it('Should trim search query', async () => {
      const firstName = '  Test '
      const lastName = ' Person  '
      const nomisId = ' ABC123   '

      req.query = {
        firstName,
        lastName,
        nomisId,
      }

      prisonerService.searchPrisoners.mockResolvedValue([])
      probationService.getProbationers.mockResolvedValue([])

      await handler.GET(req, res)

      expect(prisonerService.searchPrisoners).toHaveBeenCalledWith(
        { firstName: firstName.trim(), lastName: lastName.trim(), prisonerIdentifier: nomisId.trim() },
        res.locals.user,
      )
      expect(res.render).toHaveBeenCalledWith('pages/support/offenderSearch', {
        searchResults: [],
        searchValues: {
          firstName: 'Test',
          lastName: 'Person',
          nomisId: 'ABC123',
        },
      })
    })
  })
})
