import { Request, Response } from 'express'
import { format } from 'date-fns'
import LastMinuteHandoverCasesRoutes from './lastMinuteHandoverCases'
import LicenceService from '../../../services/licenceService'
import { LastMinuteHandoverCaseResponse } from '../../../@types/licenceApiClientTypes'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/licenceService')

describe('LastMinuteHandoverCasesRoutes', () => {
  const routes = new LastMinuteHandoverCasesRoutes(licenceService)

  const cases: Array<LastMinuteHandoverCaseResponse> = [
    {
      crn: 'CRN123',
      prisonerNumber: 'A1234BC',
      prisonCode: 'HPA',
      prisonName: 'HMP Alpha, "London"',
      releaseDate: '2025-12-24',
      probationPractitioner: 'jane.smith',
      prisonerName: 'DOE, JOHN',
      probationRegion: 'South East, Region',
      status: 'SUBMITTED',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    licenceService.getLastMinuteCases.mockResolvedValue(cases)
  })

  test('GET renders lastMinuteHandoverCases with mapped/escaped data', async () => {
    const req = {} as Request
    const res = {
      locals: { user: { username: 'A User' } },
      render: jest.fn(),
    } as unknown as Response

    await routes.GET(req, res)

    expect(licenceService.getLastMinuteCases).toHaveBeenCalledTimes(1)

    const expectedMappedRow = {
      crn: 'CRN123',
      prisonerNumber: 'A1234BC',
      prisonCode: 'HPA',
      prisonName: '"HMP Alpha, ""London"""',
      releaseDate: '2025-12-24',
      probationPractitioner: 'jane.smith',
      prisonerName: '"doe, John"',
      probationRegion: '"South East, Region"',
      status: 'SUBMITTED',
    }

    expect(res.render).toHaveBeenCalledWith('pages/reports/lastMinuteHandoverCases', {
      user: { username: 'A User' },
      lastMinuteCases: [expectedMappedRow],
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
      `attachment; filename=upcoming-releases-with-incomplete-licences-report-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`,
    )

    const headerLine = [
      'Probation Region',
      'Prison Name',
      'Release Date',
      'Licence Status',
      'Probation Practitioner',
      'Prison Number',
      'CRN',
      'Prisoner Name',
    ].join(',')

    const expectedRow = [
      '"South East, Region"',
      '"HMP Alpha, ""London"""',
      '2025-12-24',
      'SUBMITTED',
      'jane.smith',
      'A1234BC',
      'CRN123',
      '"doe, John"',
    ].join(',')

    const sentBody = (res.send as jest.Mock).mock.calls[0][0]
    expect(sentBody).toBe(`${headerLine}\n${expectedRow}`)
  })
})
