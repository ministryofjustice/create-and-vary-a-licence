import { Request, Response } from 'express'
import OffenderSearchRoutes from './offenderSearch'
import PrisonerService from '../../../services/prisonerService'
import CommunityService from '../../../services/communityService'
import { OffenderDetail } from '../../../@types/probationSearchApiClientTypes'
import { Prisoner } from '../../../@types/prisonerSearchApiClientTypes'

const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
jest.mock('../../../services/prisonerService')
jest.mock('../../../services/communityService')

describe('Route Handlers - Offender search', () => {
  const handler = new OffenderSearchRoutes(prisonerService, communityService)
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

      communityService.getOffendersByCrn.mockResolvedValue([
        {
          otherIds: {
            crn: 'X1234',
            nomsNumber: 'ABC123',
          },
        } as unknown as OffenderDetail,
      ])
      prisonerService.searchPrisoners.mockResolvedValue([
        {
          prisonerNumber: 'ABC123',
          prisonName: 'Pentonville',
          firstName: 'Peter',
          lastName: 'Pepper',
        } as unknown as Prisoner,
      ])

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/support/offenderSearch', {
        searchResults: [{ crn: 'X1234', name: 'Peter Pepper', nomisId: 'ABC123', prison: 'Pentonville' }],
        searchValues: { crn: 'X1234' },
      })
    })

    it('Should search by name and nomisId', async () => {
      req.query = {
        firstName: 'Peter',
        lastName: 'Pepper',
        nomisId: 'ABC123',
      }

      prisonerService.searchPrisoners.mockResolvedValue([
        {
          prisonerNumber: 'ABC123',
          prisonName: 'Pentonville',
          firstName: 'Peter',
          lastName: 'Pepper',
        } as unknown as Prisoner,
      ])
      communityService.getOffendersByNomsNumbers.mockResolvedValue([
        {
          otherIds: {
            crn: 'X1234',
            nomsNumber: 'ABC123',
          },
        } as unknown as OffenderDetail,
      ])

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/support/offenderSearch', {
        searchResults: [{ crn: 'X1234', name: 'Peter Pepper', nomisId: 'ABC123', prison: 'Pentonville' }],
        searchValues: {
          firstName: 'Peter',
          lastName: 'Pepper',
          nomisId: 'ABC123',
        },
      })
    })
  })
})
