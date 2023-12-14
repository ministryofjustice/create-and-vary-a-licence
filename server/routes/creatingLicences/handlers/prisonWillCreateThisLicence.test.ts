import { Request, Response } from 'express'
import { PrisonApiPrisoner } from '../../../@types/prisonApiClientTypes'
import { OffenderDetail } from '../../../@types/probationSearchApiClientTypes'

import PrisonWillCreateThisLicenceRoutes from './prisonWillCreateThisLicence'
import LicenceService from '../../../services/licenceService'
import PrisonerService from '../../../services/prisonerService'
import CommunityService from '../../../services/communityService'

const licenceService = new LicenceService(null, null, null, null) as jest.Mocked<LicenceService>
const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
jest.mock('../../../services/licenceService')
jest.mock('../../../services/prisonerService')
jest.mock('../../../services/communityService')

describe('Route Handlers - Create Licence - Prison will create licence', () => {
  const handler = new PrisonWillCreateThisLicenceRoutes(licenceService, prisonerService, communityService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        nomisId: 'ABC123',
      },
      session: {
        returnToCase: 'some-back-link',
      },
      user: {
        username: 'joebloggs',
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
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
    beforeEach(() => {
      prisonerService.getPrisonerDetail.mockResolvedValue({
        sentenceDetail: {
          confirmedReleaseDate: '2022-11-20',
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
      licenceService.getOmuEmail.mockResolvedValue({
        id: 1,
        prisonCode: 'MDI',
        email: 'moorland@prison.gov.uk',
        dateCreated: '2023-12-12T10:21:48.860Z',
        dateLastUpdated: '2023-12-12T10:21:48.860Z',
      })
    })

    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/prisonWillCreateThisLicence', {
        licence: {
          conditionalReleaseDate: '21/11/2022',
          actualReleaseDate: '20/11/2022',
          crn: 'X1234',
          dateOfBirth: '10/11/1960',
          forename: 'Patrick',
          surname: 'Holmes',
        },
        omuEmail: 'moorland@prison.gov.uk',
        backLink: req.session.returnToCase,
      })
    })

    it('should render default return to caseload link if no session state', async () => {
      const reqWithEmptySession = {
        params: {
          licenceId: '1',
        },
        session: {},
      } as unknown as Request

      await handler.GET(reqWithEmptySession, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/prisonWillCreateThisLicence', {
        licence: {
          conditionalReleaseDate: '21/11/2022',
          actualReleaseDate: '20/11/2022',
          crn: 'X1234',
          dateOfBirth: '10/11/1960',
          forename: 'Patrick',
          surname: 'Holmes',
        },
        omuEmail: 'moorland@prison.gov.uk',
        backLink: '/licence/create/caseload',
      })
    })

    it('actualReleaseDate should be undefined if confirmedReleaseDate does not exist', async () => {
      prisonerService.getPrisonerDetail.mockResolvedValue({
        sentenceDetail: {
          conditionalReleaseDate: '2022-11-20',
        },
        dateOfBirth: '1960-11-10',
        firstName: 'Patrick',
        lastName: 'Holmes',
      } as PrisonApiPrisoner)

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/prisonWillCreateThisLicence', {
        licence: {
          conditionalReleaseDate: '20/11/2022',
          actualReleaseDate: undefined,
          crn: 'X1234',
          dateOfBirth: '10/11/1960',
          forename: 'Patrick',
          surname: 'Holmes',
        },
        omuEmail: 'moorland@prison.gov.uk',
        backLink: req.session.returnToCase,
      })
    })
  })
})
