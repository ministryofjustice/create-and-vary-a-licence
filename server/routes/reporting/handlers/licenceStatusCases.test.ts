import { Request, Response } from 'express'
import { format } from 'date-fns'
import LicenceService from '../../../services/licenceService'
import { LicenceStatusResponse } from '../../../@types/licenceApiClientTypes'
import LicenceStatusCasesRoutes from './licenceStatusCases'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/licenceService')

describe('LicenceStatusCasesRoutes', () => {
  const routes = new LicenceStatusCasesRoutes(licenceService)

  const cases: Array<LicenceStatusResponse> = [
    {
      probationRegion: 'South East Region',
      prison: 'Test Prison',
      crn: 'CRN123',
      nomisNumber: 'A1234BC',
      prisonerName: 'Test Person',
      status: 'SUBMITTED',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    licenceService.getLicenceStatusCases.mockResolvedValue(cases)
  })

  test('GET renders licenceStatusCases with mapped/escaped data', async () => {
    const req = {} as Request
    const res = {
      locals: { user: { username: 'A User' } },
      render: jest.fn(),
    } as unknown as Response

    await routes.GET(req, res)

    expect(licenceService.getLicenceStatusCases).toHaveBeenCalledTimes(1)

    const expectedMappedRow = {
      crn: 'CRN123',
      nomisNumber: 'A1234BC',
      prison: 'Test Prison',
      prisonerName: 'Test Person',
      probationRegion: 'South East Region',
      status: 'SUBMITTED',
    }

    expect(res.render).toHaveBeenCalledWith('pages/reports/licenceStatusCases', {
      user: { username: 'A User' },
      cases: [expectedMappedRow],
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
      `attachment; filename=licences-status-cases-report-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`,
    )

    const headerLine = ['Probation Region', 'Prison', 'CRN', 'Nomis Number', 'Prisoner Name', 'Licence Status'].join(
      ',',
    )

    const expectedRow = ['South East Region', 'Test Prison', 'CRN123', 'A1234BC', 'Test Person', 'SUBMITTED'].join(',')

    const sentBody = (res.send as jest.Mock).mock.calls[0][0]
    expect(sentBody).toBe(`${headerLine}\n${expectedRow}`)
  })
})
