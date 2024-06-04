import { isFuture } from 'date-fns'
import { ManagedCase } from '../../@types/managedCase'
import LicenceStatus from '../../enumeration/licenceStatus'
import Container from '../container'

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
  constructor(readonly cases: Container<ManagedCase>) {}

  getPrisonView = () =>
    this.cases
      .filter(
        c => isOutOfScope(c) || hasValidStatus(PRISON_VIEW_STATUSES, c),
        `invalid status for prison view, not one ${PRISON_VIEW_STATUSES}`
      )
      .filter(c => !isOutOfScope(c) || isInTheFuture(c), 'is out of scope and in the past')

  getProbationView = () => {
    return this.cases.filter(
      c => hasValidStatus(PROBATION_VIEW_STATUSES, c),
      `invalid status for probation view, not one ${PROBATION_VIEW_STATUSES}`
    )
  }
}

function hasValidStatus(statuses: LicenceStatus[], c: ManagedCase) {
  return statuses.includes(c?.licences[0]?.status)
}

function isOutOfScope(c: ManagedCase) {
  return hasValidStatus(OUT_OF_SCOPE_PRISON_VIEW_STATUSES, c)
}

function isInTheFuture(c: ManagedCase) {
  const releaseDate = c.nomisRecord.confirmedReleaseDate || c.nomisRecord.conditionalReleaseDate
  return isFuture(new Date(releaseDate))
}
