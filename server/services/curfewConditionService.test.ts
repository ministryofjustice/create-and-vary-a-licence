import { AdditionalCondition } from '../@types/licenceApiClientTypes'
import { User } from '../@types/CvlUserDetails'
import LicenceApiClient from '../data/licenceApiClient'
import ConditionService from './conditionService'
import CurfewConditionService from './curfewConditionService'
import LicenceService from './licenceService'
import { CURFEW_CONDITION_CODE } from '../utils/conditionRoutes'

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
      data: Object.entries(data).map(([field, value]) => ({ field, value })),
    }) as AdditionalCondition

  afterEach(() => {
    jest.clearAllMocks()
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

    await curfewConditionService.upgradeCurfewConditionData(1, [secondCurfew, unrelatedCondition, firstCurfew], user)

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
  })

  it('does nothing when there are no curfew conditions', async () => {
    await curfewConditionService.upgradeCurfewConditionData(1, [condition(4, 'other-code', {})], user)

    expect(licenceService.updateAdditionalConditionData).not.toHaveBeenCalled()
    expect(licenceService.deleteAdditionalCondition).not.toHaveBeenCalled()
  })

  it('does nothing when the legacy number of curfews is unsupported', async () => {
    const curfew = condition(5, CURFEW_CONDITION_CODE, {
      numberOfCurfews: 'Four curfews',
      curfewStart: '08:00 am',
      curfewEnd: '10:00 am',
    })

    await curfewConditionService.upgradeCurfewConditionData(1, [curfew], user)

    expect(licenceService.updateAdditionalConditionData).not.toHaveBeenCalled()
    expect(licenceService.deleteAdditionalCondition).not.toHaveBeenCalled()
  })
})
