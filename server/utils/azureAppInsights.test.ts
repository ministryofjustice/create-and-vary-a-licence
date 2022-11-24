import { DataTelemetry, EnvelopeTelemetry } from 'applicationinsights/out/Declarations/Contracts'
import { addUserDataToRequests } from './azureAppInsights'

const createEnvelope = (properties: Record<string, string | boolean>, baseType = 'RequestData') =>
  ({
    data: {
      baseType,
      baseData: { properties },
    } as DataTelemetry,
  } as EnvelopeTelemetry)

const createContext = (user: Record<string, unknown>) => ({
  'http.ServerRequest': {
    res: {
      locals: {
        user,
      },
    },
  },
})

describe('azureAppInsights', () => {
  describe('addUserDataToRequests', () => {
    it('adds probation user data to properties when present', () => {
      const user = {
        displayName: 'A User',
        deliusStaffIdentifier: 123,
        deliusStaffCode: 'D123',
        probationAreaCode: 'N53',
        probationPduCodes: ['PDU1'],
        probationLauCodes: ['LDU1'],
        probationTeamCodes: ['PT1'],
      }

      const envelope = createEnvelope({ other: 'things' })

      addUserDataToRequests(envelope, createContext(user))

      expect(envelope.data.baseData.properties).toStrictEqual({
        ...user,
        other: 'things',
      })
    })

    it('adds prison user data to properties when present', () => {
      const user = {
        displayName: 'A User',
        nomisStaffId: 'N123',
        prisonCaseload: ['MDI'],
      }

      const envelope = createEnvelope({ other: 'things' })

      addUserDataToRequests(envelope, createContext(user))

      expect(envelope.data.baseData.properties).toStrictEqual({
        ...user,
        other: 'things',
      })
    })

    it('adds auth user data to properties when present', () => {
      const user = { displayName: 'A User' }

      const envelope = createEnvelope({ other: 'things' })

      addUserDataToRequests(envelope, createContext(user))

      expect(envelope.data.baseData.properties).toStrictEqual({
        ...user,
        other: 'things',
      })
    })

    it('returns true when not RequestData type', () => {
      const envelope = createEnvelope({}, 'NOT_REQUEST_DATA')

      const response = addUserDataToRequests(envelope, createContext({}))

      expect(response).toStrictEqual(true)
    })

    it('handles when no properties have been set', () => {
      const user = { displayName: 'A User' }
      const envelope = createEnvelope(undefined)

      addUserDataToRequests(envelope, createContext(user))

      expect(envelope.data.baseData.properties).toStrictEqual(user)
    })

    it('handles missing user details', () => {
      const envelope = createEnvelope({ other: 'things' })

      addUserDataToRequests(envelope, {
        'http.ServerRequest': {},
      })

      expect(envelope.data.baseData.properties).toEqual({
        other: 'things',
      })
    })
  })
})
