import conditionsConfig from '../config/conditions'

export function getStandardConditions(): Record<string, unknown>[] {
  return conditionsConfig.standardConditions
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
