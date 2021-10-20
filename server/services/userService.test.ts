import UserService from './userService'
import HmppsAuthClient, { AuthUserEmail, AuthUserDetails } from '../data/hmppsAuthClient'
import PrisonApiClient from '../data/prisonApiClient'
import { PrisonApiCaseload, PrisonApiUserDetail } from '../@types/prisonApiClientTypes'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/prisonApiClient')

const token = 'some token'

describe('User service', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let prisonApiClient: jest.Mocked<PrisonApiClient>
  let userService: UserService

  beforeEach(() => {
    hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
    prisonApiClient = new PrisonApiClient(null) as jest.Mocked<PrisonApiClient>
    userService = new UserService(hmppsAuthClient, prisonApiClient)
  })

  describe('getAuthUser', () => {
    it('Retrieves user name and active caseload', async () => {
      hmppsAuthClient.getUser.mockResolvedValue({ name: 'john smith', activeCaseLoadId: 'MDI' } as AuthUserDetails)
      const result = await userService.getAuthUser(token)
      expect(result.name).toEqual('john smith')
      expect(result.activeCaseLoadId).toEqual('MDI')
      expect(hmppsAuthClient.getUser).toBeCalled()
    })

    it('Propagates any errors', async () => {
      hmppsAuthClient.getUser.mockRejectedValue(new Error('some error'))
      await expect(userService.getAuthUser(token)).rejects.toEqual(new Error('some error'))
      expect(hmppsAuthClient.getUser).toBeCalled()
    })
  })

  describe('getAuthUserEmail', () => {
    it('Retrieves user email', async () => {
      hmppsAuthClient.getUserEmail.mockResolvedValue({
        username: 'JSMITH',
        email: 'js@prison.com',
        verified: true,
      } as AuthUserEmail)
      const result = await userService.getAuthUserEmail(token)
      expect(result.email).toEqual('js@prison.com')
      expect(hmppsAuthClient.getUserEmail).toBeCalled()
    })

    it('Propagates any errors', async () => {
      hmppsAuthClient.getUserEmail.mockRejectedValue(new Error('some error'))
      await expect(userService.getAuthUserEmail(token)).rejects.toEqual(new Error('some error'))
      expect(hmppsAuthClient.getUserEmail).toBeCalled()
    })
  })

  describe('getPrisonUser', () => {
    it('Retrieves prison user details', async () => {
      prisonApiClient.getUser.mockResolvedValue({
        accountStatus: 'ACTIVE',
        active: true,
        activeCaseLoadId: 'MDI',
        expiredFlag: false,
        firstName: 'Robert',
        lastName: 'Charles',
        lockedFlag: false,
        staffId: 123,
        username: 'RCHARLES',
      } as PrisonApiUserDetail)
      const result = await userService.getPrisonUser(token)
      expect(result.firstName).toEqual('Robert')
      expect(result.lastName).toEqual('Charles')
      expect(result.staffId).toEqual(123)
      expect(result.activeCaseLoadId).toEqual('MDI')
      expect(prisonApiClient.getUser).toBeCalled()
    })

    it('Propagates any errors', async () => {
      prisonApiClient.getUser.mockRejectedValue(new Error('some error'))
      await expect(userService.getPrisonUser(token)).rejects.toEqual(new Error('some error'))
    })
  })

  describe('getPrisonUserCaseloads', () => {
    const stubbedPrisonCaseloadData: PrisonApiCaseload[] = [
      {
        caseLoadId: 'MDI',
        caseloadFunction: 'GENERAL',
        currentlyActive: true,
        description: 'Moorland (HMP)',
        type: 'INST',
      },
      {
        caseLoadId: 'LEI',
        caseloadFunction: 'GENERAL',
        currentlyActive: true,
        description: 'Leeds (HMP)',
        type: 'INST',
      },
      {
        caseLoadId: 'BMI',
        caseloadFunction: 'GENERAL',
        currentlyActive: false,
        description: 'Birmingham (HMP)',
        type: 'INST',
      },
    ]

    it('Retrieves prison user caseload details', async () => {
      prisonApiClient.getUserCaseloads.mockResolvedValue(stubbedPrisonCaseloadData)
      const result = await userService.getPrisonUserCaseloads(token)
      const activeCaseload = result.map(cs => (cs.currentlyActive ? cs.caseLoadId : null)).filter(cs => cs)
      expect(activeCaseload).toHaveLength(2)
      expect(activeCaseload[0]).toEqual('MDI')
      expect(activeCaseload[1]).toEqual('LEI')
      expect(prisonApiClient.getUserCaseloads).toBeCalled()
    })

    it('Propagates any errors', async () => {
      prisonApiClient.getUserCaseloads.mockRejectedValue(new Error('some error'))
      await expect(userService.getPrisonUserCaseloads(token)).rejects.toEqual(new Error('some error'))
    })
  })
})
