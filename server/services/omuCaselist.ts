import { isFuture } from 'date-fns'
import { ManagedCase } from '../@types/managedCase'
import LicenceStatus from '../enumeration/licenceStatus'
import Container from './container'

const PRISON_VIEW_STATUSES = [
  LicenceStatus.NOT_STARTED,
  LicenceStatus.IN_PROGRESS,
  LicenceStatus.APPROVED,
  LicenceStatus.SUBMITTED,
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

  getPrisonView = () => {
    return this.cases.filter(c => {
      const releaseDate =
        c.nomisRecord.confirmedReleaseDate ||
        c.nomisRecord.conditionalReleaseOverrideDate ||
        c.nomisRecord.conditionalReleaseDate

      return (
        PRISON_VIEW_STATUSES.includes(c?.licences[0]?.status) ||
        (releaseDate
          ? OUT_OF_SCOPE_PRISON_VIEW_STATUSES.includes(c?.licences[0]?.status) && isFuture(new Date(releaseDate))
          : false)
      )
    }, `invalid status for prison view, not one ${PRISON_VIEW_STATUSES}`)
  }

  getProbationView = () => {
    return this.cases.filter(
      c => PROBATION_VIEW_STATUSES.includes(c?.licences[0]?.status),
      `invalid status for probation view, not one ${PROBATION_VIEW_STATUSES}`
    )
  }
}
