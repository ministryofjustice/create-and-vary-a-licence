import { Request, Response } from 'express'

import ApprovalViewRoutes from './approvalView'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'
import ProbationService from '../../../services/probationService'
import HdcService, { CvlHdcLicenceData } from '../../../services/hdcService'
import { DeliusStaff } from '../../../@types/deliusClientTypes'
import LicenceKind from '../../../enumeration/LicenceKind'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
const deliusStaff = new ProbationService(null) as jest.Mocked<ProbationService>
const hdcService = new HdcService(null) as jest.Mocked<HdcService>

const username = 'joebloggs'
const displayName = 'Joe Bloggs'

jest.mock('../../../services/probationService')
jest.mock('../../../services/hdcService')

describe('Route - view and approve a licence', () => {
  const handler = new ApprovalViewRoutes(licenceService, deliusStaff, hdcService)
  let req: Request
  let res: Response

  const exampleHdcLicenceData = {
    curfewAddress: {
      addressLine1: 'addressLineOne',
      addressLine2: 'addressLineTwo',
      townOrCity: 'addressTownOrCity',
      county: 'county',
      postcode: 'addressPostcode',
    },
    firstNightCurfewHours: {
      firstNightFrom: '09:00',
      firstNightUntil: '17:00',
    },
    curfewTimes: [
      {
        curfewTimesSequence: 1,
        fromDay: 'MONDAY',
        fromTime: '17:00:00',
        untilDay: 'TUESDAY',
        untilTime: '09:00:00',
      },
      {
        curfewTimesSequence: 2,
        fromDay: 'TUESDAY',
        fromTime: '17:00:00',
        untilDay: 'WEDNESDAY',
        untilTime: '09:00:00',
      },
    ],
    allCurfewTimesEqual: true,
  } as CvlHdcLicenceData

  beforeEach(() => {
    req = {
      body: {
        licenceId: '1',
      },
    } as unknown as Request

    licenceService.updateStatus = jest.fn()
    licenceService.recordAuditEvent = jest.fn()
    hdcService.getHdcLicenceData.mockResolvedValue(exampleHdcLicenceData)
  })

  describe('GET', () => {
    deliusStaff.getStaffDetailByUsername.mockResolvedValue({
      id: 3000,
      username: 'joebloggs',
      email: 'joebloggs@probation.gov.uk',
      telephoneNumber: '07777777777',
      name: {
        forename: 'Joe',
        surname: 'Bloggs',
      },
    } as DeliusStaff)

    it('should check status is SUBMITTED else redirect to case list', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username, displayName },
          licence: {
            id: 1,
            statusCode: LicenceStatus.APPROVED,
            surname: 'Bobson',
            forename: 'Bob',
            appointmentTime: '12/12/2022 14:16',
            additionalLicenceConditions: [],
            additionalPssConditions: [],
            bespokeConditions: [],
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/licence/approve/cases')
      expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
      expect(deliusStaff.getStaffDetailByUsername).not.toHaveBeenCalled()
    })

    it('should render a single licence view for approval', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username, displayName },
          licence: {
            id: 1,
            statusCode: LicenceStatus.SUBMITTED,
            surname: 'Bobson',
            forename: 'Bob',
            appointmentTime: '12/12/2022 14:16',
            additionalLicenceConditions: [],
            additionalPssConditions: [],
            bespokeConditions: [],
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/approve/view', {
        additionalConditions: [],
        staffDetails: {
          email: 'joebloggs@probation.gov.uk',
          name: 'Joe Bloggs',
          telephone: '07777777777',
        },
        returnPath: encodeURIComponent(`/licence/approve/id/${res.locals.licence.id}/view`),
        hdcLicenceData: null,
      })
      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
      expect(deliusStaff.getStaffDetailByUsername).toHaveBeenCalled()
    })

    it('should pass through HDC licence data for HDC licences', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username, displayName },
          licence: {
            id: 1,
            statusCode: LicenceStatus.SUBMITTED,
            kind: LicenceKind.HDC,
            surname: 'Bobson',
            forename: 'Bob',
            appointmentTime: '12/12/2022 14:16',
            additionalLicenceConditions: [],
            additionalPssConditions: [],
            bespokeConditions: [],
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/approve/view', {
        additionalConditions: [],
        staffDetails: {
          email: 'joebloggs@probation.gov.uk',
          name: 'Joe Bloggs',
          telephone: '07777777777',
        },
        returnPath: encodeURIComponent(`/licence/approve/id/${res.locals.licence.id}/view`),
        hdcLicenceData: exampleHdcLicenceData,
      })
    })
  })

  describe('POST', () => {
    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: { user: { username, displayName } },
    } as unknown as Response

    it('should approve a licence', async () => {
      req = {
        body: { licenceId: '1', result: 'approve' },
      } as unknown as Request

      await handler.POST(req, res)
      expect(licenceService.updateStatus).toHaveBeenCalledWith('1', LicenceStatus.APPROVED, res.locals.user)
      expect(res.redirect).toHaveBeenCalledWith('/licence/approve/id/1/confirm-approved')
    })

    it('should reject a licence', async () => {
      req = {
        body: { licenceId: '1', result: 'reject' },
      } as unknown as Request

      await handler.POST(req, res)
      expect(licenceService.updateStatus).toHaveBeenCalledWith('1', LicenceStatus.REJECTED, res.locals.user)
      expect(res.redirect).toHaveBeenCalledWith('/licence/approve/id/1/confirm-rejected')
    })
  })
})
