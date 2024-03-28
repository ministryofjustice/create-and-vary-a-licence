import { Request, Response } from 'express'
import { PrisonApiPrisoner } from '../../../@types/prisonApiClientTypes'
import { OffenderDetail } from '../../../@types/probationSearchApiClientTypes'

import PrisonWillCreateThisLicenceRoutes from './prisonWillCreateThisLicence'
import LicenceService from '../../../services/licenceService'
import CommunityService from '../../../services/communityService'
import { CaseloadItem } from '../../../@types/licenceApiClientTypes'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
jest.mock('../../../services/licenceService')
jest.mock('../../../services/communityService')

describe('Route Handlers - Create Licence - Prison will create licence', () => {
  const handler = new PrisonWillCreateThisLicenceRoutes(licenceService, communityService)
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
      licenceService.getPrisonerDetail.mockResolvedValue({
        prisoner: {
          prisonerNumber: 'G4169UO',
          firstName: 'Patrick',
          lastName: 'Holmes',
          dateOfBirth: '1960-11-10',
          status: 'ACTIVE IN',
          prisonId: 'BAI',
          sentenceStartDate: '2017-03-01',
          releaseDate: '2024-07-19',
          confirmedReleaseDate: '2022-11-20',
          sentenceExpiryDate: '2028-08-31',
          licenceExpiryDate: '2028-08-31',
          conditionalReleaseDate: '2022-11-21',
        },
        cvl: { licenceType: 'AP', hardStopDate: null, hardStopWarningDate: null },
      } as CaseloadItem)
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
        licenceType: 'AP',
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
        licenceType: 'AP',
      })
    })

    it('actualReleaseDate should be undefined if confirmedReleaseDate does not exist', async () => {
      licenceService.getPrisonerDetail.mockResolvedValue({
        prisoner: {
          firstName: 'Patrick',
          lastName: 'Holmes',
          dateOfBirth: '1960-11-10',
          conditionalReleaseDate: '2022-11-20',
        },
        cvl: { licenceType: 'AP', hardStopDate: null, hardStopWarningDate: null },
      } as CaseloadItem)

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
        licenceType: 'AP',
      })
    })
  })
})
