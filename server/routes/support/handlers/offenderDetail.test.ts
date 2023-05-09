import { Request, Response } from 'express'
import PrisonerService from '../../../services/prisonerService'
import CommunityService from '../../../services/communityService'
import OffenderDetailRoutes from './offenderDetail'
import type { Prisoner } from '../../../@types/prisonerSearchApiClientTypes'
import type { OffenderDetail } from '../../../@types/probationSearchApiClientTypes'
import type { LicenceSummary, Licence } from '../../../@types/licenceApiClientTypes'
import HdcStatus from '../../../@types/HdcStatus'
import LicenceService from '../../../services/licenceService'

const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
const licenceService = new LicenceService(null, null, null, null) as jest.Mocked<LicenceService>

jest.mock('../../../services/prisonerService')
jest.mock('../../../services/communityService')
jest.mock('../../../services/licenceService')

describe('Route Handlers - Offender detail', () => {
  const handler = new OffenderDetailRoutes(prisonerService, communityService, licenceService)
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

      communityService.searchProbationers.mockResolvedValue([
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

      communityService.getStaffDetailByStaffCode.mockResolvedValue({
        email: 'mr.t@probation.gov.uk',
        telephoneNumber: '078929482994',
      })

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/support/offenderDetail', {
        prisonerDetail: {
          ...expectedPrisonerDetail,
          conditionalReleaseDate: '01 Jun 2022',
          confirmedReleaseDate: '01 Jun 2022',
          crn: 'X1234',
          determinate: 'Yes',
          dob: '01 Jan 1970',
          hdcStatus: 'PENDING',
          hdced: '01 May 2022',
          licenceExpiryDate: '01 Jun 2022',
          name: 'Peter Pepper',
          paroleEligibilityDate: '01 Jan 2022',
          postRecallReleaseDate: '01 May 2022',
          sentenceExpiryDate: '01 Jun 2022',
          tused: '01 May 2023',
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
        licence: {
          led: 'Not found',
          ssd: 'Not found',
          crd: 'Not found',
          ard: 'Not found',
          sed: 'Not found',
          tused: 'Not found',
          tussd: 'Not found',
        },
      })
    })
  })
  it('Should render all offender information with eligible HDC licence', async () => {
    req.params = {
      nomsId: 'ABC123',
    }

    const expectedPrisonerDetail = {
      firstName: 'David',
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
      dateOfBirth: '1995-03-05',
    } as Prisoner
    prisonerService.searchPrisonersByNomisIds.mockResolvedValue([expectedPrisonerDetail])

    communityService.searchProbationers.mockResolvedValue([
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

    communityService.getStaffDetailByStaffCode.mockResolvedValue({
      email: 'mr.g@probation.gov.uk',
      telephoneNumber: '078929482994',
    })

    await handler.GET(req, res)
    expect(res.render).toHaveBeenCalledWith('pages/support/offenderDetail', {
      prisonerDetail: {
        ...expectedPrisonerDetail,
        conditionalReleaseDate: '01 Jun 2022',
        confirmedReleaseDate: '01 Jun 2022',
        crn: 'X1234',
        determinate: 'Yes',
        dob: '05 Mar 1995',
        hdcStatus: 'APPROVED',
        hdced: '01 May 2022',
        licenceExpiryDate: '01 Jun 2022',
        name: 'David Pepper',
        paroleEligibilityDate: '01 Jan 2022',
        postRecallReleaseDate: '01 May 2022',
        sentenceExpiryDate: '01 Jun 2022',
        tused: '01 May 2023',
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
      licence: {
        led: 'Not found',
        ssd: 'Not found',
        crd: 'Not found',
        ard: 'Not found',
        sed: 'Not found',
        tused: 'Not found',
        tussd: 'Not found',
      },
    })
  })
  it('Should render all offender information with NULL sentence dates', async () => {
    req.params = {
      nomsId: 'ABC123',
    }

    const expectedPrisonerDetail = {
      firstName: 'David',
      lastName: 'Pepper',
      conditionalReleaseDate: null,
      confirmedReleaseDate: '2022-06-01',
      postRecallReleaseDate: null,
      topupSupervisionExpiryDate: null,
      homeDetentionCurfewEligibilityDate: null,
      sentenceExpiryDate: null,
      licenceExpiryDate: null,
      paroleEligibilityDate: null,
      indeterminateSentence: false,
      dateOfBirth: '1995-03-05',
    } as Prisoner
    prisonerService.searchPrisonersByNomisIds.mockResolvedValue([expectedPrisonerDetail])

    communityService.searchProbationers.mockResolvedValue([
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

    communityService.getStaffDetailByStaffCode.mockResolvedValue({
      email: 'mr.g@probation.gov.uk',
      telephoneNumber: '078929482994',
    })

    await handler.GET(req, res)
    expect(res.render).toHaveBeenCalledWith('pages/support/offenderDetail', {
      prisonerDetail: {
        ...expectedPrisonerDetail,
        conditionalReleaseDate: 'Not found',
        confirmedReleaseDate: '01 Jun 2022',
        crn: 'X1234',
        determinate: 'Yes',
        dob: '05 Mar 1995',
        hdcStatus: 'APPROVED',
        hdced: 'Not found',
        licenceExpiryDate: 'Not found',
        name: 'David Pepper',
        paroleEligibilityDate: 'Not found',
        postRecallReleaseDate: 'Not found',
        sentenceExpiryDate: 'Not found',
        tused: 'Not found',
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
      licence: {
        led: 'Not found',
        ssd: 'Not found',
        crd: 'Not found',
        ard: 'Not found',
        sed: 'Not found',
        tused: 'Not found',
        tussd: 'Not found',
      },
    })
  })

  it('Should render all offender information with eligible HDC licence and license dates', async () => {
    req.params = {
      nomsId: 'ABC123',
    }

    const expectedPrisonerDetail = {
      firstName: 'David',
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
      dateOfBirth: '1995-03-05',
    } as Prisoner
    prisonerService.searchPrisonersByNomisIds.mockResolvedValue([expectedPrisonerDetail])

    communityService.searchProbationers.mockResolvedValue([
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

    communityService.getStaffDetailByStaffCode.mockResolvedValue({
      email: 'mr.g@probation.gov.uk',
      telephoneNumber: '078929482994',
    })

    licenceService.getLatestLicenceByNomisIdsAndStatus.mockResolvedValue({
      licenceId: 1,
    } as LicenceSummary)

    licenceService.getLicence.mockResolvedValue({
      licenceId: 1,
      conditionalReleaseDate: '01/01/2022',
      actualReleaseDate: '02/01/2022',
      sentenceStartDate: '03/01/2022',
      sentenceEndDate: '04/01/2022',
      licenceExpiryDate: '05/01/2022',
      topupSupervisionStartDate: '06/01/2022',
      topupSupervisionExpiryDate: '07/01/2022',
    } as Partial<Licence> as Licence)

    await handler.GET(req, res)
    expect(res.render).toHaveBeenCalledWith('pages/support/offenderDetail', {
      prisonerDetail: {
        ...expectedPrisonerDetail,
        conditionalReleaseDate: '01 Jun 2022',
        confirmedReleaseDate: '01 Jun 2022',
        crn: 'X1234',
        determinate: 'Yes',
        dob: '05 Mar 1995',
        hdcStatus: 'APPROVED',
        hdced: '01 May 2022',
        licenceExpiryDate: '01 Jun 2022',
        name: 'David Pepper',
        paroleEligibilityDate: '01 Jan 2022',
        postRecallReleaseDate: '01 May 2022',
        sentenceExpiryDate: '01 Jun 2022',
        tused: '01 May 2023',
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
      licence: {
        led: '05 Jan 2022',
        ssd: '03 Jan 2022',
        crd: '01 Jan 2022',
        ard: '02 Jan 2022',
        sed: '04 Jan 2022',
        tused: '07 Jan 2022',
        tussd: '06 Jan 2022',
      },
    })
  })
})
