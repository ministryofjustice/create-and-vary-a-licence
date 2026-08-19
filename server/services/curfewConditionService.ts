import assert from 'assert'
import { AdditionalCondition } from '../@types/licenceApiClientTypes'
import { User } from '../@types/CvlUserDetails'
import CurfewType from '../enumeration/CurfewType'
import LicenceType from '../enumeration/licenceType'
import { CURFEW_CONDITION_CODE } from '../utils/conditionRoutes'
import LicenceService from './licenceService'

type CurfewFieldPair = [startField: string, endField: string]
type UpgradedCurfewData = Record<string, string>

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

  isCurfewConditionUpdateRequired = (conditionCode: string, licenceVersion: string): boolean =>
    conditionCode === CURFEW_CONDITION_CODE && licenceVersion === '4.0'

  async upgradeCurfewCondition(
    licenceId: number,
    conditionType: LicenceType,
    conditions: AdditionalCondition[],
    user: User,
    licenceVersion: string,
  ): Promise<void> {
    const curfewConditions = this.getCurfewConditionsInSaveOrder(conditions)
    assert(curfewConditions.length, 'No curfew conditions found to upgrade')

    const [primaryCondition, ...duplicateConditions] = curfewConditions
    const upgradedData = this.buildUpgradedData(curfewConditions)

    await this.licenceService.updateAdditionalConditionData(licenceId.toString(), primaryCondition, upgradedData, user)
    await this.deleteDuplicateConditions(licenceId, duplicateConditions, user)
    await this.licenceService.updateAdditionalConditions(
      licenceId,
      conditionType,
      { additionalConditions: this.getConditionCodesWithSingleCurfew(conditions) },
      user,
      licenceVersion,
    )
  }

  private getConditionCodesWithSingleCurfew = (conditions: AdditionalCondition[]): string[] => {
    const firstCurfewIndex = conditions.findIndex(condition => condition.code === CURFEW_CONDITION_CODE)

    return conditions
      .filter((condition, index) => condition.code !== CURFEW_CONDITION_CODE || index === firstCurfewIndex)
      .map(condition => condition.code)
  }

  private getCurfewConditionsInSaveOrder = (conditions: AdditionalCondition[]): AdditionalCondition[] =>
    conditions
      .filter(condition => condition.code === CURFEW_CONDITION_CODE)
      .sort((first, second) => first.sequence - second.sequence)

  private buildUpgradedData = (conditions: AdditionalCondition[]): UpgradedCurfewData => {
    const numberOfCurfews = this.getDataValue(conditions[0], 'numberOfCurfews') as CurfewType
    const targetFields = curfewFieldsByType[numberOfCurfews]
    assert(targetFields, `Unsupported number of curfews: ${numberOfCurfews}`)

    const timePairs = conditions.slice(0, targetFields.length).map((_, index) => ({
      start: this.getLegacyTime(conditions, index, 'curfewStart'),
      end: this.getLegacyTime(conditions, index, 'curfewEnd'),
    }))

    const upgradedData: UpgradedCurfewData = { numberOfCurfews }

    timePairs.forEach(({ start, end }, index) => {
      const [startField, endField] = targetFields[index]
      upgradedData[startField] = start
      upgradedData[endField] = end
    })

    return upgradedData
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
