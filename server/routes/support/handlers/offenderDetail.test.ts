import { Request, Response } from 'express'
import PrisonerService from '../../../services/prisonerService'
import ProbationService from '../../../services/probationService'
import OffenderDetailRoutes from './offenderDetail'
import type {
  LicenceSummary,
  Licence,
  PrisonerWithCvlFields,
  EligibilityAssessment,
} from '../../../@types/licenceApiClientTypes'
import HdcStatus from '../../../@types/HdcStatus'
import LicenceService from '../../../services/licenceService'
import { DeliusManager } from '../../../@types/deliusClientTypes'
import LicenceKind from '../../../enumeration/LicenceKind'

const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
const probationService = new ProbationService(null) as jest.Mocked<ProbationService>
const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

jest.mock('../../../services/prisonerService')
jest.mock('../../../services/probationService')
jest.mock('../../../services/licenceService')

const licenceDatesNotFound = {
  lsd: 'Not found',
  led: 'Not found',
  ssd: 'Not found',
  crd: 'Not found',
  ard: 'Not found',
  sed: 'Not found',
  tused: 'Not found',
  tussd: 'Not found',
  hdcad: 'Not found',
  hdcEndDate: 'Not found',
  prrd: 'Not found',
}

const prisonerDetail = {
  prisoner: {
    firstName: 'Joe',
    lastName: 'Bloggs',
    conditionalReleaseDate: '2022-06-01',
    confirmedReleaseDate: '2022-06-01',
    actualParoleDate: '2017-06-21',
    postRecallReleaseDate: '2022-05-01',
    topupSupervisionExpiryDate: '2023-05-01',
    homeDetentionCurfewEligibilityDate: '2022-05-01',
    homeDetentionCurfewActualDate: '2022-05-01',
    homeDetentionCurfewEndDate: '2023-05-01',
    sentenceStartDate: '2015-03-26',
    sentenceExpiryDate: '2022-06-01',
    licenceExpiryDate: '2022-06-01',
    paroleEligibilityDate: '2022-01-01',
    indeterminateSentence: false,
    dateOfBirth: '1970-01-01',
    recall: true,
  },
  cvl: {
    isInHardStopPeriod: false,
    hardStopDate: '03/02/2023',
    hardStopWarningDate: '01/02/2023',
  },
} as PrisonerWithCvlFields

const probationPractitioner = {
  staffCode: 'X12345',
  email: 'tcom@probation.gov.uk',
  lau: 'LAU A',
  ldu: 'LAU A',
  name: 'Test Com',
  pdu: 'PDU A',
  region: 'Wales',
  teamCode: 'TEAMA',
  team: 'Team A',
  telephone: '078929482994',
}
const emptyDate = undefined as string

describe('Route Handlers - Offender detail', () => {
  const handler = new OffenderDetailRoutes(prisonerService, probationService, licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    res = {
      locals: {
        user: {},
      },
      render: jest.fn(),
    } as unknown as Response
    req = {
      params: {
        nomsId: 'ABC123',
      },
    } as unknown as Request

    probationService.getResponsibleCommunityManager.mockResolvedValue({
      id: 2000,
      case: { crn: 'X1234' },
      code: 'X12345',
      username: 'testcom',
      email: 'tcom@probation.gov.uk',
      telephoneNumber: '078929482994',
      name: {
        forename: 'Test',
        surname: 'Com',
      },
      provider: {
        code: 'N03',
        description: 'Wales',
      },
      team: {
        code: 'TEAMA',
        description: 'Team A',
        borough: {
          code: 'PDUA',
          description: 'PDU A',
        },
        district: {
          code: 'LAUA',
          description: 'LAU A',
        },
      },
    } as DeliusManager)

    licenceService.getIneligibilityReasons.mockResolvedValue({ ineligibilityReasons: [] } as EligibilityAssessment)

    licenceService.getLatestLicenceByNomisIdsAndStatus.mockResolvedValue({
      licenceId: 1,
    } as LicenceSummary)
  })

  describe('GET', () => {
    it('Should render all offender information', async () => {
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetail)

      prisonerService.getHdcStatuses.mockResolvedValue([
        {
          bookingId: '1',
          approvalStatus: 'PENDING',
          checksPassed: true,
        } as HdcStatus,
      ])

      licenceService.getIS91Status.mockResolvedValue(false)

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/support/offenderDetail', {
        prisonerDetail: {
          ...prisonerDetail.prisoner,
          conditionalReleaseDate: '01 Jun 2022',
          confirmedReleaseDate: '01 Jun 2022',
          actualParoleDate: '21 Jun 2017',
          crn: 'X1234',
          determinate: 'Yes',
          dob: '01 Jan 1970',
          hdcStatus: 'PENDING',
          hdced: '01 May 2022',
          hdcad: '01 May 2022',
          hdcEndDate: '01 May 2023',
          licenceExpiryDate: '01 Jun 2022',
          name: 'Joe Bloggs',
          paroleEligibilityDate: '01 Jan 2022',
          postRecallReleaseDate: '01 May 2022',
          sentenceStartDate: '26 Mar 2015',
          sentenceExpiryDate: '01 Jun 2022',
          tused: '01 May 2023',
          recall: 'Yes',
          hardStop: {
            cutoffDate: '03/02/2023',
            isInHardStopPeriod: false,
            warningDate: '01/02/2023',
          },
        },
        probationPractitioner,
        cvlCom: {
          email: 'Not found',
          username: 'Not found',
          team: 'Not found',
          lau: 'Not found',
          pdu: 'Not found',
          region: 'Not found',
        },
        licence: licenceDatesNotFound,
        ineligibilityReasons: { ineligibilityReasons: [] },
        is91Status: 'No',
      })
    })
  })
  it('Should render all offender information with eligible HDC licence', async () => {
    const expectedPrisonerDetail = {
      prisoner: {
        ...prisonerDetail.prisoner,
        recall: false,
        dateOfBirth: '1970-01-01',
      },
      cvl: prisonerDetail.cvl,
    }
    licenceService.getPrisonerDetail.mockResolvedValue(expectedPrisonerDetail)

    prisonerService.getHdcStatuses.mockResolvedValue([
      {
        bookingId: '1',
        approvalStatus: 'APPROVED',
        checksPassed: true,
      } as HdcStatus,
    ])

    licenceService.getIS91Status.mockResolvedValue(false)

    await handler.GET(req, res)
    expect(res.render).toHaveBeenCalledWith('pages/support/offenderDetail', {
      prisonerDetail: {
        ...expectedPrisonerDetail.prisoner,
        conditionalReleaseDate: '01 Jun 2022',
        confirmedReleaseDate: '01 Jun 2022',
        crn: 'X1234',
        determinate: 'Yes',
        dob: '01 Jan 1970',
        hdcStatus: 'APPROVED',
        hdced: '01 May 2022',
        hdcad: '01 May 2022',
        hdcEndDate: '01 May 2023',
        licenceExpiryDate: '01 Jun 2022',
        name: 'Joe Bloggs',
        paroleEligibilityDate: '01 Jan 2022',
        postRecallReleaseDate: '01 May 2022',
        sentenceStartDate: '26 Mar 2015',
        sentenceExpiryDate: '01 Jun 2022',
        actualParoleDate: '21 Jun 2017',
        tused: '01 May 2023',
        recall: 'No',
        hardStop: {
          cutoffDate: '03/02/2023',
          isInHardStopPeriod: false,
          warningDate: '01/02/2023',
        },
      },
      probationPractitioner,
      cvlCom: {
        email: 'Not found',
        username: 'Not found',
        team: 'Not found',
        lau: 'Not found',
        pdu: 'Not found',
        region: 'Not found',
      },
      licence: licenceDatesNotFound,
      ineligibilityReasons: { ineligibilityReasons: [] },
      is91Status: 'No',
    })
  })
  it('Should render all offender information with NULL sentence dates', async () => {
    const expectedPrisonerDetail = {
      prisoner: {
        ...prisonerDetail.prisoner,
        confirmedReleaseDate: '2022-06-01',
        conditionalReleaseDate: emptyDate,
        homeDetentionCurfewEligibilityDate: emptyDate,
        homeDetentionCurfewActualDate: emptyDate,
        homeDetentionCurfewEndDate: emptyDate,
        licenceExpiryDate: emptyDate,
        paroleEligibilityDate: emptyDate,
        postRecallReleaseDate: emptyDate,
        sentenceStartDate: emptyDate,
        sentenceExpiryDate: emptyDate,
        topupSupervisionExpiryDate: emptyDate,
        actualParoleDate: emptyDate,
        recall: false,
      },
      cvl: prisonerDetail.cvl,
    }

    licenceService.getPrisonerDetail.mockResolvedValue(expectedPrisonerDetail)

    prisonerService.getHdcStatuses.mockResolvedValue([
      {
        bookingId: '1',
        approvalStatus: 'APPROVED',
        checksPassed: true,
      } as HdcStatus,
    ])

    licenceService.getIS91Status.mockResolvedValue(false)

    await handler.GET(req, res)
    expect(res.render).toHaveBeenCalledWith('pages/support/offenderDetail', {
      prisonerDetail: {
        ...expectedPrisonerDetail.prisoner,
        conditionalReleaseDate: 'Not found',
        confirmedReleaseDate: '01 Jun 2022',
        crn: 'X1234',
        determinate: 'Yes',
        dob: '01 Jan 1970',
        hdcStatus: 'APPROVED',
        hdced: 'Not found',
        hdcad: 'Not found',
        actualParoleDate: 'Not found',
        hdcEndDate: 'Not found',
        licenceExpiryDate: 'Not found',
        name: 'Joe Bloggs',
        paroleEligibilityDate: 'Not found',
        postRecallReleaseDate: 'Not found',
        sentenceStartDate: 'Not found',
        sentenceExpiryDate: 'Not found',
        tused: 'Not found',
        recall: 'No',
        hardStop: {
          cutoffDate: '03/02/2023',
          isInHardStopPeriod: false,
          warningDate: '01/02/2023',
        },
      },
      probationPractitioner,
      cvlCom: {
        email: 'Not found',
        username: 'Not found',
        team: 'Not found',
        lau: 'Not found',
        pdu: 'Not found',
        region: 'Not found',
      },
      licence: licenceDatesNotFound,
      ineligibilityReasons: { ineligibilityReasons: [] },
      is91Status: 'No',
    })
  })

  it('Should render all offender information with eligible HDC licence and licence dates', async () => {
    const expectedPrisonerDetail = {
      prisoner: {
        ...prisonerDetail.prisoner,
        homeDetentionCurfewEligibilityDate: '2022-05-01',
        homeDetentionCurfewActualDate: '2022-05-01',
        homeDetentionCurfewEndDate: '2023-05-01',
        sentenceStartDate: '2015-03-26',
        sentenceExpiryDate: '2022-06-01',
        licenceExpiryDate: '2022-06-01',
        paroleEligibilityDate: emptyDate,
        indeterminateSentence: false,
        dateOfBirth: '1970-01-01',
        recall: true,
      },
      cvl: prisonerDetail.cvl,
    }

    licenceService.getPrisonerDetail.mockResolvedValue(expectedPrisonerDetail)

    prisonerService.getHdcStatuses.mockResolvedValue([
      {
        bookingId: '1',
        approvalStatus: 'APPROVED',
        checksPassed: true,
      } as HdcStatus,
    ])

    licenceService.getLicence.mockResolvedValue({
      id: 1,
      kind: LicenceKind.HDC,
      conditionalReleaseDate: '01/06/2022',
      actualReleaseDate: '02/01/2022',
      sentenceStartDate: '03/01/2022',
      sentenceEndDate: '04/01/2022',
      licenceStartDate: '01/01/2022',
      licenceExpiryDate: '05/01/2022',
      topupSupervisionStartDate: '06/01/2022',
      topupSupervisionExpiryDate: '07/01/2022',
      homeDetentionCurfewActualDate: '01/01/2022',
      homeDetentionCurfewEndDate: '05/01/2022',
    } as Partial<Licence> as Licence)

    await handler.GET(req, res)
    expect(res.render).toHaveBeenCalledWith('pages/support/offenderDetail', {
      prisonerDetail: {
        ...expectedPrisonerDetail.prisoner,
        conditionalReleaseDate: '01 Jun 2022',
        confirmedReleaseDate: '01 Jun 2022',
        dob: '01 Jan 1970',
        crn: 'X1234',
        determinate: 'Yes',
        hdcStatus: 'APPROVED',
        hdced: '01 May 2022',
        hdcad: '01 May 2022',
        actualParoleDate: '21 Jun 2017',
        hdcEndDate: '01 May 2023',
        licenceExpiryDate: '01 Jun 2022',
        name: 'Joe Bloggs',
        paroleEligibilityDate: 'Not found',
        postRecallReleaseDate: '01 May 2022',
        sentenceStartDate: '26 Mar 2015',
        sentenceExpiryDate: '01 Jun 2022',
        tused: '01 May 2023',
        recall: 'Yes',
        hardStop: {
          cutoffDate: '03/02/2023',
          isInHardStopPeriod: false,
          warningDate: '01/02/2023',
        },
      },
      probationPractitioner,
      cvlCom: {
        email: 'Not found',
        username: 'Not found',
        team: 'Not found',
        lau: 'Not found',
        pdu: 'Not found',
        region: 'Not found',
      },
      licence: {
        lsd: '01 Jan 2022',
        led: '05 Jan 2022',
        ssd: '03 Jan 2022',
        crd: '01 Jun 2022',
        ard: '02 Jan 2022',
        sed: '04 Jan 2022',
        tused: '07 Jan 2022',
        tussd: '06 Jan 2022',
        hdcad: '01 Jan 2022',
        hdcEndDate: '05 Jan 2022',
        prrd: 'Not found',
      },
      ineligibilityReasons: { ineligibilityReasons: [] },
      is91Status: 'No',
    })
  })

  it('should render COM information stored in CVL', async () => {
    const expectedPrisonerDetail = {
      prisoner: {
        firstName: 'Joe',
        lastName: 'Bloggs',
        conditionalReleaseDate: '2022-06-01',
        confirmedReleaseDate: '2022-06-01',
        postRecallReleaseDate: '2022-05-01',
        topupSupervisionExpiryDate: '2023-05-01',
        homeDetentionCurfewEligibilityDate: '2022-05-01',
        homeDetentionCurfewActualDate: '2022-05-01',
        homeDetentionCurfewEndDate: '2023-05-01',
        sentenceExpiryDate: '2022-06-01',
        licenceExpiryDate: '2022-06-01',
        paroleEligibilityDate: '2022-01-01',
        indeterminateSentence: false,
        dateOfBirth: '1970-01-01',
        recall: true,
      },
      cvl: {
        isInHardStopPeriod: false,
        hardStopDate: '03/02/2023',
        hardStopWarningDate: '01/02/2023',
      },
    } as PrisonerWithCvlFields

    licenceService.getPrisonerDetail.mockResolvedValue(expectedPrisonerDetail)

    prisonerService.getHdcStatuses.mockResolvedValue([
      {
        bookingId: '1',
        approvalStatus: 'APPROVED',
        checksPassed: true,
      } as HdcStatus,
    ])

    licenceService.getLicence.mockResolvedValue({
      id: 1,
      comEmail: 'test@probation.gov.uk',
      comUsername: 'AB123C',
      probationTeamDescription: 'Team 1',
      probationLauDescription: 'LAU 1',
      probationPduDescription: 'PDU 1',
      probationAreaDescription: 'Region 1',
    } as Licence)

    licenceService.getIS91Status.mockResolvedValue(false)

    await handler.GET(req, res)
    expect(res.render).toHaveBeenCalledWith(
      'pages/support/offenderDetail',
      expect.objectContaining({
        cvlCom: {
          email: 'test@probation.gov.uk',
          username: 'AB123C',
          team: 'Team 1',
          lau: 'LAU 1',
          pdu: 'PDU 1',
          region: 'Region 1',
        },
      }),
    )
  })

  it('Should render ineligibility reasons if the offender is ineligible for CVL', async () => {
    prisonerService.getHdcStatuses.mockResolvedValue([
      {
        bookingId: '1',
        approvalStatus: 'PENDING',
        checksPassed: true,
      } as HdcStatus,
    ])

    licenceService.getLicence.mockResolvedValue({
      id: 1,
      comEmail: 'test@probation.gov.uk',
      comUsername: 'AB123C',
      probationTeamDescription: 'Team 1',
      probationLauDescription: 'LAU 1',
      probationPduDescription: 'PDU 1',
      probationAreaDescription: 'Region 1',
      probationTeamCode: 'Test',
    } as Licence)

    licenceService.getIneligibilityReasons.mockResolvedValue({
      ineligibilityReasons: ['Reason1', 'Reason2'],
    } as EligibilityAssessment)

    licenceService.getIS91Status.mockResolvedValue(false)

    await handler.GET(req, res)
    expect(res.render).toHaveBeenCalledWith(
      'pages/support/offenderDetail',
      expect.objectContaining({
        ineligibilityReasons: { ineligibilityReasons: ['Reason1', 'Reason2'] },
      }),
    )
  })

  it('should render all offender information if probationPractitioner is null', async () => {
    licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetail)

    prisonerService.getHdcStatuses.mockResolvedValue([
      {
        bookingId: '1',
        approvalStatus: 'PENDING',
        checksPassed: true,
      } as HdcStatus,
    ])

    licenceService.getIS91Status.mockResolvedValue(false)
    probationService.getResponsibleCommunityManager.mockResolvedValue(null)
    await handler.GET(req, res)
    expect(res.render).toHaveBeenCalledWith(
      'pages/support/offenderDetail',
      expect.objectContaining({
        prisonerDetail: expect.objectContaining({
          crn: '',
        }),
        probationPractitioner: {
          name: 'Not allocated',
          staffCode: '',
          email: '',
          telephone: '',
          team: '',
          teamCode: '',
          ldu: '',
          lau: '',
          pdu: '',
          region: '',
        },
      }),
    )
  })
})
