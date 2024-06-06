import { isFuture } from 'date-fns'
import { ManagedCase } from '../../@types/managedCase'
import LicenceStatus from '../../enumeration/licenceStatus'

const PRISON_VIEW_STATUSES = [
  LicenceStatus.NOT_STARTED,
  LicenceStatus.IN_PROGRESS,
  LicenceStatus.APPROVED,
  LicenceStatus.SUBMITTED,
  LicenceStatus.TIMED_OUT,
]

const OUT_OF_SCOPE_PRISON_VIEW_STATUSES = [
  LicenceStatus.NOT_IN_PILOT,
  LicenceStatus.OOS_RECALL,
  LicenceStatus.OOS_BOTUS,
]

const PROBATION_VIEW_STATUSES = [
  LicenceStatus.ACTIVE,
  LicenceStatus.VARIATION_IN_PROGRESS,
  LicenceStatus.VARIATION_APPROVED,
  LicenceStatus.VARIATION_SUBMITTED,
]

export default class OmuCaselist {
  constructor(readonly cases: ManagedCase[]) {}

  getPrisonView = () =>
    this.cases
      .filter(c => isOutOfScope(c) || hasAnyStatusOf(PRISON_VIEW_STATUSES, c))
      .filter(c => !isOutOfScope(c) || isReleaseInFuture(c))

  getProbationView = () => {
    return this.cases.filter(c => hasAnyStatusOf(PROBATION_VIEW_STATUSES, c))
  }
}

function hasAnyStatusOf(statuses: LicenceStatus[], c: ManagedCase) {
  return statuses.includes(c?.licences[0]?.status)
}

function isOutOfScope(c: ManagedCase) {
  return hasAnyStatusOf(OUT_OF_SCOPE_PRISON_VIEW_STATUSES, c)
}

function isReleaseInFuture(c: ManagedCase) {
  const releaseDate = c.nomisRecord.confirmedReleaseDate || c.nomisRecord.conditionalReleaseDate
  return isFuture(new Date(releaseDate))
}
