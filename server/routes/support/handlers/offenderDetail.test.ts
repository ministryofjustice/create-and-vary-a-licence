import { Request, Response } from 'express'
import ProbationService from '../../../services/probationService'
import OffenderDetailRoutes from './offenderDetail'
import type {
  LicenceSummary,
  Licence,
  PrisonerWithCvlFields,
  EligibilityAssessment,
  RecallSupportInfo,
  RemandSupportInfo,
  Is91SupportInfo,
  HdcSupportInfo,
} from '../../../@types/licenceApiClientTypes'
import LicenceService from '../../../services/licenceService'
import { DeliusManager } from '../../../@types/deliusClientTypes'
import LicenceKind from '../../../enumeration/LicenceKind'

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
    eligibleKind: 'FIXED_TERM',
    hdcStatus: 'NOT_A_HDC_RELEASE',
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

const defaultRecallDetails: RecallSupportInfo = {
  recallType: 'FIXED_TERM',
  recallName: 'Fixed Term Recall 28 days',
  fixTermSentenceTypes: ['FTR_ORA'],
  standardRecallSentenceTypes: [],
  otherSentenceTypes: ['ADIMP_ORA'],
}

const defaultRemandDetails: RemandSupportInfo = {
  isRemand: true,
  courtEventOutcomeCode: '4200',
  courtEventOutcomeDescription: 'Some description',
}

const defaultIs91Details: Is91SupportInfo = {
  isIs91Case: true,
  is91CourtEventOutcomes: [{ courtEventOutcomeCode: '1', courtEventOutcomeDescription: 'description-1' }],
}

const defaultHdcSupportDetails: HdcSupportInfo = {
  passed: true,
  approvalStatus: 'APPROVED',
  checksPassedDate: '2026-01-21',
  approvalStatusDate: '2026-03-23',
  refusedReason: 'REFUSED',
}

const defaultEligibilityAssessment: EligibilityAssessment = {
  genericIneligibilityReasons: ['Reason1', 'Reason2'],
} as EligibilityAssessment

describe('Route Handlers - Offender detail', () => {
  const handler = new OffenderDetailRoutes(probationService, licenceService)
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

    licenceService.getLatestLicenceByNomisIdsAndStatus.mockResolvedValue({
      licenceId: 1,
    } as LicenceSummary)

    licenceService.getSupportInfo.mockResolvedValue({
      is91SupportInfo: defaultIs91Details,
      recallSupportInfo: defaultRecallDetails,
      remandSupportInfo: defaultRemandDetails,
      nomisHdcSupportInfo: defaultHdcSupportDetails,
      eligibilityAssessment: defaultEligibilityAssessment,
    })
  })

  describe('GET', () => {
    it('Should render all offender information', async () => {
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetail)

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/support/offenderDetail', {
        prisonerDetail: {
          ...prisonerDetail.prisoner,
          conditionalReleaseDate: '1 Jun 2022',
          confirmedReleaseDate: '1 Jun 2022',
          actualParoleDate: '21 Jun 2017',
          crn: 'X1234',
          determinate: 'Yes',
          dob: '1 Jan 1970',
          hdcStatus: 'NOT_A_HDC_RELEASE',
          hdced: '1 May 2022',
          hdcad: '1 May 2022',
          hdcEndDate: '1 May 2023',
          licenceExpiryDate: '1 Jun 2022',
          name: 'Joe Bloggs',
          paroleEligibilityDate: '1 Jan 2022',
          postRecallReleaseDate: '1 May 2022',
          sentenceStartDate: '26 Mar 2015',
          sentenceExpiryDate: '1 Jun 2022',
          tused: '1 May 2023',
          recall: 'Yes',
          remand: 'Yes',
          hardStop: {
            cutoffDate: '3 Feb 2023',
            isInHardStopPeriod: false,
            warningDate: '1 Feb 2023',
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
        is91Status: 'Yes',
        is91Details: defaultIs91Details,
        hdcDetails: defaultHdcSupportDetails,
        recallDetails: defaultRecallDetails,
        remandDetails: defaultRemandDetails,
        ineligibilityReasons: defaultEligibilityAssessment,
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
      cvl: {
        ...prisonerDetail.cvl,
        eligibleKind: 'HDC',
      },
    } as PrisonerWithCvlFields
    licenceService.getPrisonerDetail.mockResolvedValue(expectedPrisonerDetail)

    await handler.GET(req, res)
    expect(res.render).toHaveBeenCalledWith('pages/support/offenderDetail', {
      prisonerDetail: {
        ...expectedPrisonerDetail.prisoner,
        conditionalReleaseDate: '1 Jun 2022',
        confirmedReleaseDate: '1 Jun 2022',
        crn: 'X1234',
        determinate: 'Yes',
        dob: '1 Jan 1970',
        hdcStatus: 'NOT_A_HDC_RELEASE',
        hdced: '1 May 2022',
        hdcad: '1 May 2022',
        hdcEndDate: '1 May 2023',
        licenceExpiryDate: '1 Jun 2022',
        name: 'Joe Bloggs',
        paroleEligibilityDate: '1 Jan 2022',
        postRecallReleaseDate: '1 May 2022',
        sentenceStartDate: '26 Mar 2015',
        sentenceExpiryDate: '1 Jun 2022',
        actualParoleDate: '21 Jun 2017',
        tused: '1 May 2023',
        recall: 'No',
        remand: 'Yes',
        hardStop: {
          cutoffDate: '3 Feb 2023',
          isInHardStopPeriod: false,
          warningDate: '1 Feb 2023',
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
      is91Status: 'Yes',
      is91Details: defaultIs91Details,
      hdcDetails: defaultHdcSupportDetails,
      recallDetails: defaultRecallDetails,
      remandDetails: defaultRemandDetails,
      ineligibilityReasons: defaultEligibilityAssessment,
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

    await handler.GET(req, res)
    expect(res.render).toHaveBeenCalledWith('pages/support/offenderDetail', {
      prisonerDetail: {
        ...expectedPrisonerDetail.prisoner,
        conditionalReleaseDate: 'Not found',
        confirmedReleaseDate: '1 Jun 2022',
        crn: 'X1234',
        determinate: 'Yes',
        dob: '1 Jan 1970',
        hdcStatus: 'NOT_A_HDC_RELEASE',
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
        remand: 'Yes',
        hardStop: {
          cutoffDate: '3 Feb 2023',
          isInHardStopPeriod: false,
          warningDate: '1 Feb 2023',
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
      is91Status: 'Yes',
      is91Details: defaultIs91Details,
      hdcDetails: defaultHdcSupportDetails,
      recallDetails: defaultRecallDetails,
      remandDetails: defaultRemandDetails,
      ineligibilityReasons: defaultEligibilityAssessment,
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
        conditionalReleaseDate: '1 Jun 2022',
        confirmedReleaseDate: '1 Jun 2022',
        dob: '1 Jan 1970',
        crn: 'X1234',
        determinate: 'Yes',
        hdcStatus: 'NOT_A_HDC_RELEASE',
        hdced: '1 May 2022',
        hdcad: '1 May 2022',
        actualParoleDate: '21 Jun 2017',
        hdcEndDate: '1 May 2023',
        licenceExpiryDate: '1 Jun 2022',
        name: 'Joe Bloggs',
        paroleEligibilityDate: 'Not found',
        postRecallReleaseDate: '1 May 2022',
        sentenceStartDate: '26 Mar 2015',
        sentenceExpiryDate: '1 Jun 2022',
        tused: '1 May 2023',
        recall: 'Yes',
        remand: 'Yes',
        hardStop: {
          cutoffDate: '3 Feb 2023',
          isInHardStopPeriod: false,
          warningDate: '1 Feb 2023',
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
        lsd: '1 Jan 2022',
        led: '5 Jan 2022',
        ssd: '3 Jan 2022',
        crd: '1 Jun 2022',
        ard: '2 Jan 2022',
        sed: '4 Jan 2022',
        tused: '7 Jan 2022',
        tussd: '6 Jan 2022',
        hdcad: '1 Jan 2022',
        hdcEndDate: '5 Jan 2022',
        prrd: 'Not found',
      },
      is91Status: 'Yes',
      is91Details: defaultIs91Details,
      hdcDetails: defaultHdcSupportDetails,
      recallDetails: defaultRecallDetails,
      remandDetails: defaultRemandDetails,
      ineligibilityReasons: defaultEligibilityAssessment,
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

    licenceService.getLicence.mockResolvedValue({
      id: 1,
      comEmail: 'test@probation.gov.uk',
      comUsername: 'AB123C',
      probationTeamDescription: 'Team 1',
      probationLauDescription: 'LAU 1',
      probationPduDescription: 'PDU 1',
      probationAreaDescription: 'Region 1',
    } as Licence)

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

  it('should render all offender information if probationPractitioner is null', async () => {
    licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetail)

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
