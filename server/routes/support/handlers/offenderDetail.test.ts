import { Request, Response } from 'express'
import PrisonerService from '../../../services/prisonerService'
import ProbationService from '../../../services/probationService'
import OffenderDetailRoutes from './offenderDetail'
import type { OffenderDetail } from '../../../@types/probationSearchApiClientTypes'
import type { LicenceSummary, Licence, CaseloadItem } from '../../../@types/licenceApiClientTypes'
import HdcStatus from '../../../@types/HdcStatus'
import LicenceService from '../../../services/licenceService'
import { DeliusStaff } from '../../../@types/deliusClientTypes'
import LicenceKind from '../../../enumeration/LicenceKind'

const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
const probationService = new ProbationService(null, null) as jest.Mocked<ProbationService>
const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

jest.mock('../../../services/prisonerService')
jest.mock('../../../services/probationService')
jest.mock('../../../services/licenceService')

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
    req = {} as Request
  })

  describe('GET', () => {
    it('Should render all offender information', async () => {
      req.params = {
        nomsId: 'ABC123',
      }

      const expectedPrisonerDetail = {
        prisoner: {
          firstName: 'Peter',
          lastName: 'Pepper',
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
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
          hardStopDate: '03/02/2023',
          hardStopWarningDate: '01/02/2023',
        },
      } as CaseloadItem
      licenceService.getPrisonerDetail.mockResolvedValue(expectedPrisonerDetail)

      probationService.searchProbationers.mockResolvedValue([
        {
          otherIds: {
            crn: 'X1234',
          },
          offenderManagers: [
            {
              active: true,
              staff: {
                code: 'X123',
                forenames: 'Mr',
                surname: 'T',
              },
              team: {
                description: 'The A Team',
                localDeliveryUnit: {
                  description: 'LDU A',
                },
                district: {
                  description: 'LAU A',
                },
                borough: {
                  description: 'PDU A',
                },
              },
              probationArea: {
                description: 'Wales',
              },
            },
          ],
        } as unknown as OffenderDetail,
      ])

      prisonerService.getHdcStatuses.mockResolvedValue([
        {
          bookingId: '1',
          approvalStatus: 'PENDING',
          checksPassed: true,
        } as HdcStatus,
      ])

      probationService.getStaffDetailByStaffCode.mockResolvedValue({
        email: 'mr.t@probation.gov.uk',
        telephoneNumber: '078929482994',
      } as DeliusStaff)

      licenceService.getIneligibilityReasons.mockResolvedValue([])

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
          hdcStatus: 'PENDING',
          hdced: '01 May 2022',
          hdcad: '01 May 2022',
          hdcEndDate: '01 May 2023',
          licenceExpiryDate: '01 Jun 2022',
          name: 'Peter Pepper',
          paroleEligibilityDate: '01 Jan 2022',
          postRecallReleaseDate: '01 May 2022',
          sentenceExpiryDate: '01 Jun 2022',
          tused: '01 May 2023',
          recall: 'Yes',
          hardStop: {
            cutoffDate: '03/02/2023',
            isInHardStopPeriod: false,
            warningDate: '01/02/2023',
          },
        },
        probationPractitioner: {
          email: 'mr.t@probation.gov.uk',
          lau: 'LAU A',
          ldu: 'LDU A',
          name: 'Mr T',
          pdu: 'PDU A',
          region: 'Wales',
          team: 'The A Team',
          telephone: '078929482994',
        },
        cvlCom: {
          email: 'Not found',
          username: 'Not found',
          team: 'Not found',
          lau: 'Not found',
          pdu: 'Not found',
          region: 'Not found',
        },
        licence: {
          led: 'Not found',
          ssd: 'Not found',
          crd: 'Not found',
          ard: 'Not found',
          sed: 'Not found',
          tused: 'Not found',
          tussd: 'Not found',
          hdcad: 'Not found',
          hdcEndDate: 'Not found',
        },
        ineligibilityReasons: [],
        is91Status: false,
      })
    })
  })
  it('Should render all offender information with eligible HDC licence', async () => {
    req.params = {
      nomsId: 'ABC123',
    }

    const expectedPrisonerDetail = {
      prisoner: {
        firstName: 'David',
        lastName: 'Pepper',
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
        dateOfBirth: '1995-03-05',
        recall: false,
      },
      cvl: {
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
        hardStopDate: '03/02/2023',
        hardStopWarningDate: '01/02/2023',
      },
    } as CaseloadItem
    licenceService.getPrisonerDetail.mockResolvedValue(expectedPrisonerDetail)

    probationService.searchProbationers.mockResolvedValue([
      {
        otherIds: {
          crn: 'X1234',
        },
        offenderManagers: [
          {
            active: true,
            staff: {
              code: 'X123',
              forenames: 'Mr',
              surname: 'T',
            },
            team: {
              description: 'The A Team',
              localDeliveryUnit: {
                description: 'LDU A',
              },
              district: {
                description: 'LAU A',
              },
              borough: {
                description: 'PDU A',
              },
            },
            probationArea: {
              description: 'Wales',
            },
          },
        ],
      } as unknown as OffenderDetail,
    ])

    prisonerService.getHdcStatuses.mockResolvedValue([
      {
        bookingId: '1',
        approvalStatus: 'APPROVED',
        checksPassed: true,
      } as HdcStatus,
    ])

    probationService.getStaffDetailByStaffCode.mockResolvedValue({
      email: 'mr.g@probation.gov.uk',
      telephoneNumber: '078929482994',
    } as DeliusStaff)

    licenceService.getIneligibilityReasons.mockResolvedValue([])

    licenceService.getIS91Status.mockResolvedValue(false)

    await handler.GET(req, res)
    expect(res.render).toHaveBeenCalledWith('pages/support/offenderDetail', {
      prisonerDetail: {
        ...expectedPrisonerDetail.prisoner,
        conditionalReleaseDate: '01 Jun 2022',
        confirmedReleaseDate: '01 Jun 2022',
        crn: 'X1234',
        determinate: 'Yes',
        dob: '05 Mar 1995',
        hdcStatus: 'APPROVED',
        hdced: '01 May 2022',
        hdcad: '01 May 2022',
        hdcEndDate: '01 May 2023',
        licenceExpiryDate: '01 Jun 2022',
        name: 'David Pepper',
        paroleEligibilityDate: '01 Jan 2022',
        postRecallReleaseDate: '01 May 2022',
        sentenceExpiryDate: '01 Jun 2022',
        tused: '01 May 2023',
        recall: 'No',
        hardStop: {
          cutoffDate: '03/02/2023',
          isInHardStopPeriod: false,
          warningDate: '01/02/2023',
        },
      },
      probationPractitioner: {
        email: 'mr.g@probation.gov.uk',
        lau: 'LAU A',
        ldu: 'LDU A',
        name: 'Mr T',
        pdu: 'PDU A',
        region: 'Wales',
        team: 'The A Team',
        telephone: '078929482994',
      },
      cvlCom: {
        email: 'Not found',
        username: 'Not found',
        team: 'Not found',
        lau: 'Not found',
        pdu: 'Not found',
        region: 'Not found',
      },
      licence: {
        led: 'Not found',
        ssd: 'Not found',
        crd: 'Not found',
        ard: 'Not found',
        sed: 'Not found',
        tused: 'Not found',
        tussd: 'Not found',
        hdcad: 'Not found',
        hdcEndDate: 'Not found',
      },
      ineligibilityReasons: [],
      is91Status: false,
    })
  })
  it('Should render all offender information with NULL sentence dates', async () => {
    req.params = {
      nomsId: 'ABC123',
    }

    const expectedPrisonerDetail = {
      prisoner: {
        firstName: 'David',
        lastName: 'Pepper',
        confirmedReleaseDate: '2022-06-01',
        indeterminateSentence: false,
        dateOfBirth: '1995-03-05',
        recall: false,
      },
      cvl: {
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
        hardStopDate: '03/02/2023',
        hardStopWarningDate: '01/02/2023',
      },
    } as CaseloadItem
    licenceService.getPrisonerDetail.mockResolvedValue(expectedPrisonerDetail)

    probationService.searchProbationers.mockResolvedValue([
      {
        otherIds: {
          crn: 'X1234',
        },
        offenderManagers: [
          {
            active: true,
            staff: {
              code: 'X123',
              forenames: 'Mr',
              surname: 'T',
            },
            team: {
              description: 'The A Team',
              localDeliveryUnit: {
                description: 'LDU A',
              },
              district: {
                description: 'LAU A',
              },
              borough: {
                description: 'PDU A',
              },
            },
            probationArea: {
              description: 'Wales',
            },
          },
        ],
      } as unknown as OffenderDetail,
    ])

    prisonerService.getHdcStatuses.mockResolvedValue([
      {
        bookingId: '1',
        approvalStatus: 'APPROVED',
        checksPassed: true,
      } as HdcStatus,
    ])

    probationService.getStaffDetailByStaffCode.mockResolvedValue({
      email: 'mr.g@probation.gov.uk',
      telephoneNumber: '078929482994',
    } as DeliusStaff)

    licenceService.getIneligibilityReasons.mockResolvedValue([])

    licenceService.getIS91Status.mockResolvedValue(false)

    await handler.GET(req, res)
    expect(res.render).toHaveBeenCalledWith('pages/support/offenderDetail', {
      prisonerDetail: {
        ...expectedPrisonerDetail.prisoner,
        conditionalReleaseDate: 'Not found',
        confirmedReleaseDate: '01 Jun 2022',
        crn: 'X1234',
        determinate: 'Yes',
        dob: '05 Mar 1995',
        hdcStatus: 'APPROVED',
        hdced: 'Not found',
        hdcad: 'Not found',
        hdcEndDate: 'Not found',
        licenceExpiryDate: 'Not found',
        name: 'David Pepper',
        paroleEligibilityDate: 'Not found',
        postRecallReleaseDate: 'Not found',
        sentenceExpiryDate: 'Not found',
        tused: 'Not found',
        recall: 'No',
        hardStop: {
          cutoffDate: '03/02/2023',
          isInHardStopPeriod: false,
          warningDate: '01/02/2023',
        },
      },
      probationPractitioner: {
        email: 'mr.g@probation.gov.uk',
        lau: 'LAU A',
        ldu: 'LDU A',
        name: 'Mr T',
        pdu: 'PDU A',
        region: 'Wales',
        team: 'The A Team',
        telephone: '078929482994',
      },
      cvlCom: {
        email: 'Not found',
        username: 'Not found',
        team: 'Not found',
        lau: 'Not found',
        pdu: 'Not found',
        region: 'Not found',
      },
      licence: {
        led: 'Not found',
        ssd: 'Not found',
        crd: 'Not found',
        ard: 'Not found',
        sed: 'Not found',
        tused: 'Not found',
        tussd: 'Not found',
        hdcad: 'Not found',
        hdcEndDate: 'Not found',
      },
      ineligibilityReasons: [],
      is91Status: false,
    })
  })

  it('Should render all offender information with eligible HDC licence and licence dates', async () => {
    req.params = {
      nomsId: 'ABC123',
    }

    const expectedPrisonerDetail = {
      prisoner: {
        firstName: 'David',
        lastName: 'Pepper',
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
        dateOfBirth: '1995-03-05',
        recall: true,
      },
      cvl: {
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
        hardStopDate: '03/02/2023',
        hardStopWarningDate: '01/02/2023',
      },
    } as CaseloadItem
    licenceService.getPrisonerDetail.mockResolvedValue(expectedPrisonerDetail)

    probationService.searchProbationers.mockResolvedValue([
      {
        otherIds: {
          crn: 'X1234',
        },
        offenderManagers: [
          {
            active: true,
            staff: {
              code: 'X123',
              forenames: 'Mr',
              surname: 'T',
            },
            team: {
              description: 'The A Team',
              localDeliveryUnit: {
                description: 'LDU A',
              },
              district: {
                description: 'LAU A',
              },
              borough: {
                description: 'PDU A',
              },
            },
            probationArea: {
              description: 'Wales',
            },
          },
        ],
      } as unknown as OffenderDetail,
    ])

    prisonerService.getHdcStatuses.mockResolvedValue([
      {
        bookingId: '1',
        approvalStatus: 'APPROVED',
        checksPassed: true,
      } as HdcStatus,
    ])

    probationService.getStaffDetailByStaffCode.mockResolvedValue({
      email: 'mr.g@probation.gov.uk',
      telephoneNumber: '078929482994',
    } as DeliusStaff)

    licenceService.getLatestLicenceByNomisIdsAndStatus.mockResolvedValue({
      licenceId: 1,
    } as LicenceSummary)

    licenceService.getLicence.mockResolvedValue({
      id: 1,
      kind: LicenceKind.HDC,
      conditionalReleaseDate: '01/01/2022',
      actualReleaseDate: '02/01/2022',
      sentenceStartDate: '03/01/2022',
      sentenceEndDate: '04/01/2022',
      licenceExpiryDate: '05/01/2022',
      topupSupervisionStartDate: '06/01/2022',
      topupSupervisionExpiryDate: '07/01/2022',
      homeDetentionCurfewActualDate: '01/01/2022',
      homeDetentionCurfewEndDate: '05/01/2022',
    } as Partial<Licence> as Licence)

    licenceService.getIneligibilityReasons.mockResolvedValue([])

    licenceService.getIS91Status.mockResolvedValue(false)

    await handler.GET(req, res)
    expect(res.render).toHaveBeenCalledWith('pages/support/offenderDetail', {
      prisonerDetail: {
        ...expectedPrisonerDetail.prisoner,
        conditionalReleaseDate: '01 Jun 2022',
        confirmedReleaseDate: '01 Jun 2022',
        crn: 'X1234',
        determinate: 'Yes',
        dob: '05 Mar 1995',
        hdcStatus: 'APPROVED',
        hdced: '01 May 2022',
        hdcad: '01 May 2022',
        hdcEndDate: '01 May 2023',
        licenceExpiryDate: '01 Jun 2022',
        name: 'David Pepper',
        paroleEligibilityDate: '01 Jan 2022',
        postRecallReleaseDate: '01 May 2022',
        sentenceExpiryDate: '01 Jun 2022',
        tused: '01 May 2023',
        recall: 'Yes',
        hardStop: {
          cutoffDate: '03/02/2023',
          isInHardStopPeriod: false,
          warningDate: '01/02/2023',
        },
      },
      probationPractitioner: {
        email: 'mr.g@probation.gov.uk',
        lau: 'LAU A',
        ldu: 'LDU A',
        name: 'Mr T',
        pdu: 'PDU A',
        region: 'Wales',
        team: 'The A Team',
        telephone: '078929482994',
      },
      cvlCom: {
        email: 'Not found',
        username: 'Not found',
        team: 'Not found',
        lau: 'Not found',
        pdu: 'Not found',
        region: 'Not found',
      },
      licence: {
        led: '05 Jan 2022',
        ssd: '03 Jan 2022',
        crd: '01 Jan 2022',
        ard: '02 Jan 2022',
        sed: '04 Jan 2022',
        tused: '07 Jan 2022',
        tussd: '06 Jan 2022',
        hdcad: '01 Jan 2022',
        hdcEndDate: '05 Jan 2022',
      },
      ineligibilityReasons: [],
      is91Status: false,
    })
  })

  it('should render COM information stored in CVL', async () => {
    req.params = {
      nomsId: 'ABC123',
    }

    const expectedPrisonerDetail = {
      prisoner: {
        firstName: 'David',
        lastName: 'Pepper',
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
        dateOfBirth: '1995-03-05',
        recall: true,
      },
      cvl: {
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
        hardStopDate: '03/02/2023',
        hardStopWarningDate: '01/02/2023',
      },
    } as CaseloadItem

    licenceService.getPrisonerDetail.mockResolvedValue(expectedPrisonerDetail)

    probationService.searchProbationers.mockResolvedValue([
      {
        otherIds: {
          crn: 'X1234',
        },
        offenderManagers: [
          {
            active: true,
            staff: {
              code: 'X123',
              forenames: 'Mr',
              surname: 'T',
            },
            team: {
              description: 'The A Team',
              localDeliveryUnit: {
                description: 'LDU A',
              },
              district: {
                description: 'LAU A',
              },
              borough: {
                description: 'PDU A',
              },
            },
            probationArea: {
              description: 'Wales',
            },
          },
        ],
      } as unknown as OffenderDetail,
    ])

    prisonerService.getHdcStatuses.mockResolvedValue([
      {
        bookingId: '1',
        approvalStatus: 'APPROVED',
        checksPassed: true,
      } as HdcStatus,
    ])

    probationService.getStaffDetailByStaffCode.mockResolvedValue({
      email: 'mr.g@probation.gov.uk',
      telephoneNumber: '078929482994',
    } as DeliusStaff)

    licenceService.getLatestLicenceByNomisIdsAndStatus.mockResolvedValue({
      licenceId: 1,
    } as LicenceSummary)

    licenceService.getLicence.mockResolvedValue({
      id: 1,
      comEmail: 'test@probation.gov.uk',
      comUsername: 'AB123C',
      probationTeamDescription: 'Team 1',
      probationLauDescription: 'LAU 1',
      probationPduDescription: 'PDU 1',
      probationAreaDescription: 'Region 1',
    } as Licence)

    licenceService.getIneligibilityReasons.mockResolvedValue([])

    licenceService.getIS91Status.mockResolvedValue(false)

    await handler.GET(req, res)
    expect(res.render).toHaveBeenCalledWith('pages/support/offenderDetail', {
      prisonerDetail: {
        ...expectedPrisonerDetail.prisoner,
        conditionalReleaseDate: '01 Jun 2022',
        confirmedReleaseDate: '01 Jun 2022',
        crn: 'X1234',
        determinate: 'Yes',
        dob: '05 Mar 1995',
        hdcStatus: 'APPROVED',
        hdced: '01 May 2022',
        hdcad: '01 May 2022',
        hdcEndDate: '01 May 2023',
        licenceExpiryDate: '01 Jun 2022',
        name: 'David Pepper',
        paroleEligibilityDate: '01 Jan 2022',
        postRecallReleaseDate: '01 May 2022',
        sentenceExpiryDate: '01 Jun 2022',
        tused: '01 May 2023',
        recall: 'Yes',
        hardStop: {
          cutoffDate: '03/02/2023',
          isInHardStopPeriod: false,
          warningDate: '01/02/2023',
        },
      },
      probationPractitioner: {
        email: 'mr.g@probation.gov.uk',
        lau: 'LAU A',
        ldu: 'LDU A',
        name: 'Mr T',
        pdu: 'PDU A',
        region: 'Wales',
        team: 'The A Team',
        telephone: '078929482994',
      },
      cvlCom: {
        email: 'test@probation.gov.uk',
        username: 'AB123C',
        team: 'Team 1',
        lau: 'LAU 1',
        pdu: 'PDU 1',
        region: 'Region 1',
      },
      licence: {
        led: 'Not found',
        ssd: 'Not found',
        crd: 'Not found',
        ard: 'Not found',
        sed: 'Not found',
        tused: 'Not found',
        tussd: 'Not found',
        hdcad: 'Not found',
        hdcEndDate: 'Not found',
      },
      ineligibilityReasons: [],
      is91Status: false,
    })
  })

  it('Should render ineligibility reasons if the offender is ineligible for CVL', async () => {
    req.params = {
      nomsId: 'ABC123',
    }

    const expectedPrisonerDetail = {
      prisoner: {
        firstName: 'Peter',
        lastName: 'Pepper',
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
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
        hardStopDate: '03/02/2023',
        hardStopWarningDate: '01/02/2023',
      },
    } as CaseloadItem
    licenceService.getPrisonerDetail.mockResolvedValue(expectedPrisonerDetail)

    probationService.searchProbationers.mockResolvedValue([
      {
        otherIds: {
          crn: 'X1234',
        },
        offenderManagers: [
          {
            active: true,
            staff: {
              code: 'X123',
              forenames: 'Mr',
              surname: 'T',
            },
            team: {
              description: 'The A Team',
              localDeliveryUnit: {
                description: 'LDU A',
              },
              district: {
                description: 'LAU A',
              },
              borough: {
                description: 'PDU A',
              },
            },
            probationArea: {
              description: 'Wales',
            },
          },
        ],
      } as unknown as OffenderDetail,
    ])

    prisonerService.getHdcStatuses.mockResolvedValue([
      {
        bookingId: '1',
        approvalStatus: 'PENDING',
        checksPassed: true,
      } as HdcStatus,
    ])

    probationService.getStaffDetailByStaffCode.mockResolvedValue({
      email: 'mr.t@probation.gov.uk',
      telephoneNumber: '078929482994',
    } as DeliusStaff)

    licenceService.getLatestLicenceByNomisIdsAndStatus.mockResolvedValue({
      licenceId: 1,
    } as LicenceSummary)

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

    licenceService.getIneligibilityReasons.mockResolvedValue(['Reason1', 'Reason2'])

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
        hdcStatus: 'PENDING',
        hdced: '01 May 2022',
        hdcad: '01 May 2022',
        hdcEndDate: '01 May 2023',
        licenceExpiryDate: '01 Jun 2022',
        name: 'Peter Pepper',
        paroleEligibilityDate: '01 Jan 2022',
        postRecallReleaseDate: '01 May 2022',
        sentenceExpiryDate: '01 Jun 2022',
        tused: '01 May 2023',
        recall: 'Yes',
        hardStop: {
          cutoffDate: '03/02/2023',
          isInHardStopPeriod: false,
          warningDate: '01/02/2023',
        },
      },
      probationPractitioner: {
        email: 'mr.t@probation.gov.uk',
        lau: 'LAU A',
        ldu: 'LDU A',
        name: 'Mr T',
        pdu: 'PDU A',
        region: 'Wales',
        team: 'The A Team',
        telephone: '078929482994',
      },
      cvlCom: {
        email: 'test@probation.gov.uk',
        lau: 'LAU 1',
        pdu: 'PDU 1',
        region: 'Region 1',
        team: 'Team 1',
        username: 'AB123C',
      },
      licence: {
        led: 'Not found',
        ssd: 'Not found',
        crd: 'Not found',
        ard: 'Not found',
        sed: 'Not found',
        tused: 'Not found',
        tussd: 'Not found',
        hdcad: 'Not found',
        hdcEndDate: 'Not found',
      },
      ineligibilityReasons: ['Reason1', 'Reason2'],
      is91Status: false,
    })
  })
})
