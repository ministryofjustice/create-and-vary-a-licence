import UserService from './userService'
import ManageUsersApiClient, { UserDetails, UserEmail } from '../data/manageUsersApiClient'
import PrisonApiClient from '../data/prisonApiClient'
import { PrisonApiCaseload, PrisonApiUserDetail } from '../@types/prisonApiClientTypes'
import ProbationService from './probationService'
import { DeliusStaff } from '../@types/deliusClientTypes'
import { User } from '../@types/CvlUserDetails'

jest.mock('../data/manageUsersApiClient')
jest.mock('../data/prisonApiClient')
jest.mock('./probationService')

const user = { token: 'some token' } as User

describe('User service', () => {
  let manageUsersApiClient: jest.Mocked<ManageUsersApiClient>
  let prisonApiClient: jest.Mocked<PrisonApiClient>
  let probationService: jest.Mocked<ProbationService>
  let userService: UserService

  beforeEach(() => {
    manageUsersApiClient = new ManageUsersApiClient(null) as jest.Mocked<ManageUsersApiClient>
    prisonApiClient = new PrisonApiClient(null) as jest.Mocked<PrisonApiClient>
    probationService = new ProbationService(null) as jest.Mocked<ProbationService>
    userService = new UserService(manageUsersApiClient, prisonApiClient, probationService)
  })

  describe('getUser', () => {
    it('Retrieves user name', async () => {
      manageUsersApiClient.getUser.mockResolvedValue({
        name: 'john smith',
      } as UserDetails)
      const result = await userService.getUser(user)
      expect(result.name).toEqual('john smith')
      expect(manageUsersApiClient.getUser).toHaveBeenCalled()
    })

    it('Propagates any errors', async () => {
      manageUsersApiClient.getUser.mockRejectedValue(new Error('some error'))
      await expect(() => userService.getUser(user)).rejects.toThrow('some error')
      expect(manageUsersApiClient.getUser).toHaveBeenCalled()
    })
  })

  describe('getUserEmail', () => {
    it('Retrieves user email', async () => {
      manageUsersApiClient.getUserEmail.mockResolvedValue({
        username: 'JSMITH',
        email: 'js@prison.com',
        verified: true,
      } as UserEmail)
      const result = await userService.getUserEmail(user)
      expect(result.email).toEqual('js@prison.com')
      expect(manageUsersApiClient.getUserEmail).toHaveBeenCalled()
    })

    it('Propagates any errors', async () => {
      manageUsersApiClient.getUserEmail.mockRejectedValue(new Error('some error'))
      await expect(() => userService.getUserEmail(user)).rejects.toThrow('some error')
      expect(manageUsersApiClient.getUserEmail).toHaveBeenCalled()
    })
  })

  describe('getPrisonUser', () => {
    it('Retrieves prison user details', async () => {
      prisonApiClient.getUser.mockResolvedValue({
        accountStatus: 'ACTIVE',
        active: true,
        activeCaseLoadId: 'MDI',
        expiredFlag: false,
        firstName: 'Joe',
        lastName: 'Bloggs',
        lockedFlag: false,
        staffId: 123,
        username: 'JBLOGGS',
      } as PrisonApiUserDetail)
      const result = await userService.getPrisonUser(user)
      expect(result.firstName).toEqual('Joe')
      expect(result.lastName).toEqual('Bloggs')
      expect(result.staffId).toEqual(123)
      expect(result.activeCaseLoadId).toEqual('MDI')
      expect(prisonApiClient.getUser).toHaveBeenCalled()
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
      expect(prisonApiClient.getUserCaseloads).toHaveBeenCalled()
    })

    it('Propagates any errors', async () => {
      prisonApiClient.getUserCaseloads.mockRejectedValue(new Error('some error'))
      await expect(() => userService.getPrisonUserCaseloads(user)).rejects.toThrow('some error')
    })
  })

  describe('getProbationUser', () => {
    it('Retrieves probation user details', async () => {
      probationService.getStaffDetailByUsername.mockResolvedValue({
        email: 'test@test.com',
        name: { forename: 'Test test', surname: 'Test' },
        code: 'X400',
        id: 1234,
        telephoneNumber: '0111 1111111',
        username: 'TestUserNPS',
      } as DeliusStaff)

      const result = await userService.getProbationUser(user)

      expect(result.email).toEqual('test@test.com')
      expect(result.name.forename).toEqual('Test test')
      expect(result.name.surname).toEqual('Test')
      expect(result.id).toEqual(1234)
      expect(result.username).toEqual('TestUserNPS')
      expect(probationService.getStaffDetailByUsername).toHaveBeenCalled()
    })

    it('Propagates any errors', async () => {
      probationService.getStaffDetailByUsername.mockRejectedValue(new Error('some error'))
      await expect(() => userService.getProbationUser(user)).rejects.toThrow('some error')
    })
  })
})
