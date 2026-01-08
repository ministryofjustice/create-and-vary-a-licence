import { Request, Response } from 'express'
import { format } from 'date-fns'
import LicenceService from '../../../services/licenceService'
import { UpcomingReleasesWithMonitoringConditionsResponse } from '../../../@types/licenceApiClientTypes'
import UpcomingReleasesWithMonitoringConditionsRoutes from './upcomingReleasesWithMonitoring'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/licenceService')

describe('UpcomingReleasesWithMonitoringRoutes', () => {
  const routes = new UpcomingReleasesWithMonitoringConditionsRoutes(licenceService)

  const cases: Array<UpcomingReleasesWithMonitoringConditionsResponse> = [
    {
      crn: 'CRN123',
      prisonNumber: 'A1234BC',
      status: 'SUBMITTED',
      licenceStartDate: '01/01/2024',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    licenceService.getUpcomingReleasesWithMonitoring.mockResolvedValue(cases)
  })

  test('GET renders upcoming releases with mapped/escaped data', async () => {
    const req = {} as Request
    const res = {
      locals: { user: { username: 'A User' } },
      render: jest.fn(),
    } as unknown as Response

    await routes.GET(req, res)

    expect(licenceService.getUpcomingReleasesWithMonitoring).toHaveBeenCalledTimes(1)

    const expectedMappedRow = {
      crn: 'CRN123',
      prisonNumber: 'A1234BC',
      status: 'SUBMITTED',
      licenceStartDate: '01/01/2024',
    }

    expect(res.render).toHaveBeenCalledWith('pages/reports/upcomingReleasesWithMonitoring', {
      user: { username: 'A User' },
      upcomingCases: [expectedMappedRow],
    })
  })

  test('GET_CSV sends CSV with proper headers, filename, and content', async () => {
    const req = {} as Request
    const res = {
      type: jest.fn(),
      setHeader: jest.fn(),
      send: jest.fn(),
    } as unknown as Response

    await routes.GET_CSV(req, res)

    expect(res.type).toHaveBeenCalledWith('text/csv')
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-disposition',
      `attachment; filename=upcoming-releases-with-monitoring-conditions-report-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`,
    )

    const headerLine = ['Prison Number', 'CRN', 'Licence Status', 'Licence Start Date'].join(',')

    const expectedRow = ['A1234BC', 'CRN123', 'SUBMITTED', '01/01/2024'].join(',')

    const sentBody = (res.send as jest.Mock).mock.calls[0][0]
    expect(sentBody).toBe(`${headerLine}\n${expectedRow}`)
  })
})
