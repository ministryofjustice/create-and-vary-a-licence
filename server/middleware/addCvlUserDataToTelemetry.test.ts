import type { Request, Response } from 'express'
import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import addCvlUserDataToTelemetry from './addCvlUserDataToTelemetry'

jest.mock('@ministryofjustice/hmpps-azure-telemetry', () => ({
  telemetry: {
    setSpanAttributes: jest.fn(),
  },
}))

const req = {} as Request
let res = {} as Response
const next = jest.fn()

describe('addCvlUserDataToTelemetry', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    res = {
      locals: {},
    } as unknown as Response
  })

  it('adds CVL user data to telemetry when a user is present', () => {
    res.locals.user = {
      username: 'joebloggs',
      authSource: 'nomis',
      displayName: 'Joe Bloggs',
      reportUserId: '12345',
      nomisStaffId: 12345,
      activeCaseload: 'MDI',
      prisonCaseload: ['MDI', 'LEI'],
      isProbationUser: false,
      probationPduCodes: [],
      probationLauCodes: [],
      probationTeamCodes: [],
      uuid: null,
      userRoles: null,
      token: null,
    }

    addCvlUserDataToTelemetry()(req, res, next)

    expect(telemetry.setSpanAttributes).toHaveBeenCalledWith({
      username: 'joebloggs',
      authSource: 'nomis',
      displayName: 'Joe Bloggs',
      userId: '12345',
      nomisStaffId: 12345,
      activeCaseLoadId: 'MDI',
      prisonCaseload: 'MDI,LEI',
      isProbationUser: false,
    })
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('adds probation data to telemetry when present', () => {
    res.locals.user = {
      username: 'joebloggs',
      authSource: 'delius',
      displayName: 'Joe Bloggs',
      deliusStaffIdentifier: 987654,
      deliusStaffCode: 'X345H',
      isProbationUser: true,
      probationAreaCode: 'N01',
      probationPduCodes: ['PDU1', 'PDU2'],
      probationLauCodes: ['LAU1'],
      probationTeamCodes: ['TEAM1', 'TEAM2'],
      prisonCaseload: [],
      uuid: null,
      userRoles: null,
      token: null,
    }

    addCvlUserDataToTelemetry()(req, res, next)

    expect(telemetry.setSpanAttributes).toHaveBeenCalledWith({
      username: 'joebloggs',
      authSource: 'delius',
      displayName: 'Joe Bloggs',
      deliusStaffIdentifier: 987654,
      deliusStaffCode: 'X345H',
      isProbationUser: true,
      probationAreaCode: 'N01',
      probationPduCodes: 'PDU1,PDU2',
      probationLauCodes: 'LAU1',
      probationTeamCodes: 'TEAM1,TEAM2',
    })
    expect(next).toHaveBeenCalledTimes(1)
  })
})
