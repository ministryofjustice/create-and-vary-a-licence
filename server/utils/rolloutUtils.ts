import config from '../config'

const anyPrisonInRollout = (prisonCaseload: string[] = []): boolean => {
  if (config.rollout.restricted) {
    const intersection = config.rollout.prisons.filter(val => prisonCaseload && prisonCaseload.includes(val))
    return intersection.length !== 0
  }
  return true
}

const anyProbationAreaInRollout = (probationAreas: string[] = []): boolean => {
  if (config.rollout.restricted) {
    const intersection = config.rollout.probationAreas.filter(val => probationAreas && probationAreas.includes(val))
    return intersection.length !== 0
  }
  return true
}

const prisonInRollout = (prisonCode: string): boolean => {
  if (config.rollout.restricted) {
    const intersection = config.rollout.prisons.filter(val => val && val === prisonCode)
    return intersection.length !== 0
  }
  return true
}

const probationAreaInRollout = (probationAreaCode: string): boolean => {
  if (config.rollout.restricted) {
    const intersection = config.rollout.probationAreas.filter(val => val && val === probationAreaCode)
    return intersection.length !== 0
  }
  return true
}

export { anyPrisonInRollout, anyProbationAreaInRollout, prisonInRollout, probationAreaInRollout }
