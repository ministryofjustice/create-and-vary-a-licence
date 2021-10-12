import conditionsConfig from '../config/conditions'
import LicenceType from '../enumeration/licenceType'

export function getVersion(): string {
  return conditionsConfig.version
}

export function getStandardConditions(licenceType: string): Record<string, unknown>[] {
  switch (licenceType) {
    case LicenceType.AP:
      return conditionsConfig.standardConditions.AP
    default:
      throw new Error(`No licence type found with code : '${licenceType}'`)
  }
}

export function getGroupedAdditionalConditions(): Record<string, unknown>[] {
  const map = new Map()
  conditionsConfig.additionalConditions.forEach(condition => {
    const collection = map.get(condition.groupName)
    if (!collection) {
      map.set(condition.groupName, [condition])
    } else {
      collection.push(condition)
    }
  })
  return Array.from(map, ([groupName, conditions]) => ({ groupName, conditions }))
}
