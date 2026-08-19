import { AdditionalCondition } from '../@types/licenceApiClientTypes'
import { User } from '../@types/CvlUserDetails'
import LicenceApiClient from '../data/licenceApiClient'
import ConditionService from './conditionService'
import CurfewConditionService from './curfewConditionService'
import LicenceService from './licenceService'
import { CURFEW_CONDITION_CODE } from '../utils/conditionRoutes'
import LicenceType from '../enumeration/licenceType'

jest.mock('../data/licenceApiClient')
jest.mock('./conditionService')
jest.mock('./licenceService')

describe('CurfewConditionService', () => {
  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
  const conditionService = new ConditionService(licenceApiClient) as jest.Mocked<ConditionService>
  const licenceService = new LicenceService(licenceApiClient, conditionService) as jest.Mocked<LicenceService>
  const curfewConditionService = new CurfewConditionService(licenceService)
  const user = { username: 'joebloggs' } as User

  const condition = (id: number, code: string, data: Record<string, string>): AdditionalCondition =>
    ({
      id,
      code,
      sequence: id,
      data: Object.entries(data).map(([field, value]) => ({ field, value })),
    }) as AdditionalCondition

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('isCurfewConditionUpdateRequired', () => {
    it('returns true for the V4 curfew condition', () => {
      expect(curfewConditionService.isCurfewConditionUpdateRequired(CURFEW_CONDITION_CODE, '4.0')).toBe(true)
    })

    it('returns false for a curfew condition from an earlier policy version', () => {
      expect(curfewConditionService.isCurfewConditionUpdateRequired(CURFEW_CONDITION_CODE, '3.0')).toBe(false)
    })

    it('returns false for a different V4 condition', () => {
      expect(curfewConditionService.isCurfewConditionUpdateRequired('other-code', '4.0')).toBe(false)
    })
  })

  it('upgrades curfew conditions in save order and deletes the redundant conditions', async () => {
    const firstCurfew = condition(5, CURFEW_CONDITION_CODE, {
      numberOfCurfews: 'Two curfews',
      curfewStart: '08:00 am',
      curfewEnd: '10:00 am',
    })
    const secondCurfew = condition(6, CURFEW_CONDITION_CODE, {
      numberOfCurfews: 'Two curfews',
      curfewStart: '06:00 pm',
      curfewEnd: '08:00 pm',
    })
    const unrelatedCondition = condition(4, 'other-code', {})
    const duplicateUnrelatedCondition = condition(7, 'other-code', {})

    await curfewConditionService.upgradeCurfewCondition(
      1,
      LicenceType.AP,
      [secondCurfew, unrelatedCondition, firstCurfew, duplicateUnrelatedCondition],
      user,
      '4.0',
    )

    expect(licenceService.updateAdditionalConditionData).toHaveBeenCalledWith(
      '1',
      firstCurfew,
      {
        numberOfCurfews: 'Two curfews',
        twoCurfewStart: '08:00 am',
        twoCurfewEnd: '10:00 am',
        twoCurfewStart2: '06:00 pm',
        twoCurfewEnd2: '08:00 pm',
      },
      user,
    )
    expect(licenceService.deleteAdditionalCondition).toHaveBeenCalledTimes(1)
    expect(licenceService.deleteAdditionalCondition).toHaveBeenCalledWith(6, 1, user)
    expect(licenceService.updateAdditionalConditions).toHaveBeenCalledWith(
      1,
      LicenceType.AP,
      { additionalConditions: [CURFEW_CONDITION_CODE, 'other-code', 'other-code'] },
      user,
      '4.0',
    )
  })

  it('does nothing when there are no curfew conditions', async () => {
    await curfewConditionService.upgradeCurfewCondition(
      1,
      LicenceType.AP,
      [condition(4, 'other-code', {})],
      user,
      '4.0',
    )

    expect(licenceService.updateAdditionalConditionData).not.toHaveBeenCalled()
    expect(licenceService.deleteAdditionalCondition).not.toHaveBeenCalled()
    expect(licenceService.updateAdditionalConditions).not.toHaveBeenCalled()
  })

  it('does nothing when the legacy number of curfews is unsupported', async () => {
    const curfew = condition(5, CURFEW_CONDITION_CODE, {
      numberOfCurfews: 'Four curfews',
      curfewStart: '08:00 am',
      curfewEnd: '10:00 am',
    })

    await curfewConditionService.upgradeCurfewCondition(1, LicenceType.AP, [curfew], user, '4.0')

    expect(licenceService.updateAdditionalConditionData).not.toHaveBeenCalled()
    expect(licenceService.deleteAdditionalCondition).not.toHaveBeenCalled()
    expect(licenceService.updateAdditionalConditions).not.toHaveBeenCalled()
  })
})
