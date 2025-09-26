import { Request, Response } from 'express'
import OffenderLicencesRoutes from './offenderLicences'
import LicenceService from '../../../services/licenceService'
import type { CvlFields, CvlPrisoner, LicenceSummary } from '../../../@types/licenceApiClientTypes'
import { convertToTitleCase } from '../../../utils/utils'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/licenceService')
jest.mock('../../../utils/urlAccessByStatus', () => jest.fn().mockReturnValue(true))

describe('Route Handlers - Offender licences', () => {
  const handler = new OffenderLicencesRoutes(licenceService)

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
    it('Should render all audit information', async () => {
      req.params = {
        nomsId: 'ABC123',
        licenceId: '1',
      }

      const expectedPrisonerDetail = {
        prisonerNumber: 'ABC123',
        firstName: 'Test',
        lastName: 'Person',
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
      } as CvlPrisoner

      const expectedLicences = {
        licenceId: 1,
        nomisId: 'ABC123',
        kind: 'CRD',
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
        comUsername: 'Test Com',
        viewable: true,
        isReviewNeeded: false,
        isInHardStopPeriod: false,
        isDueToBeReleasedInTheNextTwoWorkingDays: true,
      } as LicenceSummary

      licenceService.getPrisonerDetail.mockResolvedValue({ prisoner: expectedPrisonerDetail, cvl: {} as CvlFields })
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
