import { AdditionalCondition } from '../@types/licenceApiClientTypes'
import { User } from '../@types/CvlUserDetails'
import CurfewType from '../enumeration/CurfewType'
import { CURFEW_CONDITION_CODE } from '../utils/conditionRoutes'
import LicenceService from './licenceService'

type CurfewFieldPair = [startField: string, endField: string]
type UpgradedCurfewData = Record<string, unknown>

const curfewFieldsByType: Record<CurfewType, CurfewFieldPair[]> = {
  [CurfewType.ONE_CURFEW]: [['oneCurfewStart', 'oneCurfewEnd']],
  [CurfewType.TWO_CURFEWS]: [
    ['twoCurfewStart', 'twoCurfewEnd'],
    ['twoCurfewStart2', 'twoCurfewEnd2'],
  ],
  [CurfewType.THREE_CURFEWS]: [
    ['threeCurfewStart', 'threeCurfewEnd'],
    ['threeCurfewStart2', 'threeCurfewEnd2'],
    ['threeCurfewStart3', 'threeCurfewEnd3'],
  ],
}

export default class CurfewConditionService {
  constructor(private readonly licenceService: LicenceService) {}

  async upgradeCurfewConditionData(licenceId: number, conditions: AdditionalCondition[], user: User): Promise<void> {
    const curfewConditions = this.getCurfewConditionsInSaveOrder(conditions)
    if (!curfewConditions.length) return

    const [primaryCondition, ...duplicateConditions] = curfewConditions
    const upgradedData = this.buildUpgradedData(curfewConditions)
    if (!upgradedData) return

    await this.licenceService.updateAdditionalConditionData(licenceId.toString(), primaryCondition, upgradedData, user)
    await this.deleteDuplicateConditions(licenceId, duplicateConditions, user)
  }

  private getCurfewConditionsInSaveOrder = (conditions: AdditionalCondition[]): AdditionalCondition[] =>
    conditions
      .filter(condition => condition.code === CURFEW_CONDITION_CODE)
      .sort((first, second) => first.id - second.id)

  private buildUpgradedData = (conditions: AdditionalCondition[]): UpgradedCurfewData => {
    const numberOfCurfews = this.getDataValue(conditions[0], 'numberOfCurfews') as CurfewType
    const targetFields = curfewFieldsByType[numberOfCurfews]
    if (!targetFields) return null

    return targetFields.reduce<UpgradedCurfewData>(
      (data, [startField, endField], index) => {
        if (!conditions[index]) return data

        return {
          ...data,
          [startField]: this.getLegacyTime(conditions, index, 'curfewStart'),
          [endField]: this.getLegacyTime(conditions, index, 'curfewEnd'),
        }
      },
      { numberOfCurfews },
    )
  }

  private getLegacyTime = (conditions: AdditionalCondition[], index: number, field: string): string => {
    const suffix = index === 0 ? '' : `${index + 1}`
    return this.getDataValue(conditions[index], field) || this.getDataValue(conditions[0], `${field}${suffix}`)
  }

  private getDataValue = (condition: AdditionalCondition, field: string): string =>
    condition.data?.find(item => item.field === field)?.value

  private deleteDuplicateConditions = async (
    licenceId: number,
    duplicateConditions: AdditionalCondition[],
    user: User,
  ): Promise<void> => {
    await Promise.all(
      duplicateConditions.map(condition =>
        this.licenceService.deleteAdditionalCondition(condition.id, licenceId, user),
      ),
    )
  }
}
