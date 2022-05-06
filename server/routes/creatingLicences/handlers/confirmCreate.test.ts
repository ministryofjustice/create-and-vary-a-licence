import { Request, Response } from 'express'

import LicenceService from '../../../services/licenceService'
import ConfirmCreateRoutes from './confirmCreate'
import CommunityService from '../../../services/communityService'
import PrisonerService from '../../../services/prisonerService'
import { PrisonApiPrisoner } from '../../../@types/prisonApiClientTypes'
import { OffenderDetail } from '../../../@types/probationSearchApiClientTypes'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
jest.mock('../../../services/licenceService')
jest.mock('../../../services/communityService')
jest.mock('../../../services/prisonerService')

describe('Route Handlers - Create Licence - Confirm Create', () => {
  const handler = new ConfirmCreateRoutes(communityService, prisonerService, licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      body: {
        answer: null,
      },
      params: {
        nomisId: 'ABC123',
      },
      user: {
        username: 'joebloggs',
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
        },
      },
    } as unknown as Response
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    prisonerService.getPrisonerDetail.mockResolvedValue({
      sentenceDetail: {
        conditionalReleaseDate: '2022-11-21',
      },
      dateOfBirth: '1960-11-10',
      firstName: 'Patrick',
      lastName: 'Holmes',
    } as PrisonApiPrisoner)
    communityService.getProbationer.mockResolvedValue({
      otherIds: {
        crn: 'X1234',
      },
    } as OffenderDetail)

    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/confirmCreate', {
        licence: {
          conditionalReleaseDate: '21/11/2022',
          crn: 'X1234',
          dateOfBirth: '10/11/1960',
          forename: 'Patrick',
          surname: 'Holmes',
        },
      })
    })
  })

  describe('POST', () => {
    it('should create licence and should redirect if answer is YES', async () => {
      req.body.answer = 'Yes'
      licenceService.createLicence.mockResolvedValue({ licenceId: 1 } as LicenceSummary)
      await handler.POST(req, res)
      expect(licenceService.createLicence).toHaveBeenCalledWith('ABC123', {
        username: 'joebloggs',
      })
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/initial-meeting-name')
    })

    it('should not create licence and should redirect when answer is NO', async () => {
      req.body.answer = 'No'
      await handler.POST(req, res)
      expect(licenceService.createLicence).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/caseload')
    })
  })
})
