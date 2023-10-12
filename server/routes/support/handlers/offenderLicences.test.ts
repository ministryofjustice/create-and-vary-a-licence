import { Request, Response } from 'express'
import OffenderLicencesRoutes from './offenderLicences'
import PrisonerService from '../../../services/prisonerService'
import LicenceService from '../../../services/licenceService'
import { Prisoner } from '../../../@types/prisonerSearchApiClientTypes'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'
import { convertToTitleCase } from '../../../utils/utils'

const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
const licenceService = new LicenceService(null, null, null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/prisonerService')
jest.mock('../../../services/licenceService')
jest.mock('../../../utils/urlAccessByStatus', () => jest.fn().mockReturnValue(true))

describe('Route Handlers - Offender licences', () => {
  const handler = new OffenderLicencesRoutes(licenceService, prisonerService)

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
    it('Should should return empty licences if nomisId is null', async () => {
      req.params = {
        nomsId: null,
        licenceId: '1',
      }

      await handler.GET(req, res)

      expect(prisonerService.searchPrisonersByNomisIds).not.toHaveBeenCalled()
      expect(licenceService.getLicencesByNomisIdsAndStatus).not.toHaveBeenCalled()

      expect(res.render).toHaveBeenCalledWith('pages/support/offenderLicences', {
        prisonerDetail: {
          id: null,
          name: '',
        },
        licences: [],
      })
    })
    it('Should render all audit information', async () => {
      req.params = {
        nomsId: 'ABC123',
        licenceId: '1',
      }

      const expectedPrisonerDetail = {
        prisonerNumber: 'ABC123',
        firstName: 'Peter',
        lastName: 'Pepper',
        conditionalReleaseDate: '2022-06-01',
        confirmedReleaseDate: '2022-06-01',
        postRecallReleaseDate: '2022-05-01',
        topupSupervisionExpiryDate: '2023-05-01',
        homeDetentionCurfewEligibilityDate: '2022-05-01',
        sentenceExpiryDate: '2022-06-01',
        licenceExpiryDate: '2022-06-01',
        paroleEligibilityDate: '2022-01-01',
        indeterminateSentence: false,
        dateOfBirth: '1970-01-01',
      } as Prisoner

      prisonerService.searchPrisonersByNomisIds.mockResolvedValue([expectedPrisonerDetail])

      const expectedLicences = {
        licenceId: 1,
        licenceType: 'PSS',
        licenceStatus: 'SUBMITTED',
        probationPduDescription: null,
        probationLauCode: null,
        probationLauDescription: null,
        probationTeamCode: null,
        probationTeamDescription: null,
        conditionalReleaseDate: null,
        actualReleaseDate: null,
        crn: 'test crn',
        dateOfBirth: '2000-02-05',
        comUsername: 'Kate Jones',
        viewable: true,
      } as LicenceSummary

      licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([expectedLicences])

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/support/offenderLicences', {
        prisonerDetail: {
          id: expectedPrisonerDetail.prisonerNumber,
          name: convertToTitleCase(`${expectedPrisonerDetail.firstName} ${expectedPrisonerDetail.lastName}`),
        },
        licences: [expectedLicences],
      })
    })
  })
})
