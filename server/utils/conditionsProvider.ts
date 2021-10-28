import conditionsConfig from '../config/conditions'
import LicenceType from '../enumeration/licenceType'

export function getVersion(): string {
  return conditionsConfig.version
}

export function getStandardConditions(licenceType: string): Record<string, unknown>[] {
  switch (licenceType) {
    case LicenceType.AP:
      return conditionsConfig.standardConditions.AP.map((condition, index) => {
        return {
          ...condition,
          sequence: index,
        }
      })
    default:
      throw new Error(`No licence type found with code : '${licenceType}'`)
  }
}

export function getAdditionalConditionByCode(code: string): Record<string, unknown> {
  return conditionsConfig.additionalConditions.find(config => config.code === code)
}

export function getGroupedAdditionalConditions(): Record<string, unknown>[] {
  const map = new Map()
  conditionsConfig.additionalConditions.forEach(condition => {
    const collection = map.get(condition.category)
    if (!collection) {
      map.set(condition.category, [condition])
    } else {
      collection.push(condition)
    }
  })
  return Array.from(map, ([category, conditions]) => ({ category, conditions }))
}
