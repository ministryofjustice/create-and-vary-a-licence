import UserService from './userService'
import HmppsAuthClient, { AuthUserEmail, AuthUserDetails } from '../data/hmppsAuthClient'
import PrisonApiClient from '../data/prisonApiClient'
import { PrisonApiCaseload, PrisonApiUserDetail } from '../@types/prisonApiClientTypes'
import CommunityService from './communityService'
import { CommunityApiStaffDetails } from '../@types/communityClientTypes'
import { User } from '../@types/CvlUserDetails'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/prisonApiClient')
jest.mock('./communityService')

const user = { token: 'some token' } as User

describe('User service', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let prisonApiClient: jest.Mocked<PrisonApiClient>
  let communityService: jest.Mocked<CommunityService>
  let userService: UserService

  beforeEach(() => {
    hmppsAuthClient = new HmppsAuthClient() as jest.Mocked<HmppsAuthClient>
    prisonApiClient = new PrisonApiClient() as jest.Mocked<PrisonApiClient>
    communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
    userService = new UserService(hmppsAuthClient, prisonApiClient, communityService)
  })

  describe('getAuthUser', () => {
    it('Retrieves user name and active caseload', async () => {
      hmppsAuthClient.getUser.mockResolvedValue({ name: 'john smith', activeCaseLoadId: 'MDI' } as AuthUserDetails)
      const result = await userService.getAuthUser(user)
      expect(result.name).toEqual('john smith')
      expect(result.activeCaseLoadId).toEqual('MDI')
      expect(hmppsAuthClient.getUser).toBeCalled()
    })

    it('Propagates any errors', async () => {
      hmppsAuthClient.getUser.mockRejectedValue(new Error('some error'))
      await expect(() => userService.getAuthUser(user)).rejects.toThrow('some error')
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
      const result = await userService.getAuthUserEmail(user)
      expect(result.email).toEqual('js@prison.com')
      expect(hmppsAuthClient.getUserEmail).toBeCalled()
    })

    it('Propagates any errors', async () => {
      hmppsAuthClient.getUserEmail.mockRejectedValue(new Error('some error'))
      await expect(() => userService.getAuthUserEmail(user)).rejects.toThrow('some error')
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
      const result = await userService.getPrisonUser(user)
      expect(result.firstName).toEqual('Robert')
      expect(result.lastName).toEqual('Charles')
      expect(result.staffId).toEqual(123)
      expect(result.activeCaseLoadId).toEqual('MDI')
      expect(prisonApiClient.getUser).toBeCalled()
    })

    it('Propagates any errors', async () => {
      prisonApiClient.getUser.mockRejectedValue(new Error('some error'))
      await expect(() => userService.getPrisonUser(user)).rejects.toThrow('some error')
    })
  })

  describe('getPrisonUserCaseloads', () => {
    const stubbedPrisonCaseloadData: PrisonApiCaseload[] = [
      {
        caseLoadId: 'MDI',
        caseloadFunction: 'GENERAL',
        currentlyActive: false,
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
      const result = await userService.getPrisonUserCaseloads(user)
      const activeCaseload = result.map(cs => cs.caseLoadId)
      expect(activeCaseload).toHaveLength(3)
      expect(activeCaseload[0]).toEqual('MDI')
      expect(activeCaseload[1]).toEqual('LEI')
      expect(activeCaseload[2]).toEqual('BMI')
      expect(prisonApiClient.getUserCaseloads).toBeCalled()
    })

    it('Propagates any errors', async () => {
      prisonApiClient.getUserCaseloads.mockRejectedValue(new Error('some error'))
      await expect(() => userService.getPrisonUserCaseloads(user)).rejects.toThrow('some error')
    })
  })

  describe('getProbationUser', () => {
    it('Retrieves probation user details', async () => {
      communityService.getStaffDetailByUsername.mockResolvedValue({
        email: 'test@test.com',
        staff: { forenames: 'Test test', surname: 'Test' },
        staffCode: 'X400',
        staffIdentifier: 1234,
        telephoneNumber: '0111 1111111',
        username: 'TestUserNPS',
      } as CommunityApiStaffDetails)

      const result = await userService.getProbationUser(user)

      expect(result.email).toEqual('test@test.com')
      expect(result.staff.forenames).toEqual('Test test')
      expect(result.staff.surname).toEqual('Test')
      expect(result.staffIdentifier).toEqual(1234)
      expect(result.username).toEqual('TestUserNPS')
      expect(communityService.getStaffDetailByUsername).toBeCalled()
    })

    it('Propagates any errors', async () => {
      communityService.getStaffDetailByUsername.mockRejectedValue(new Error('some error'))
      await expect(() => userService.getProbationUser(user)).rejects.toThrow('some error')
    })
  })
})
