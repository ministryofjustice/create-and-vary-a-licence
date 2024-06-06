import moment from 'moment'
import { isFuture, isWithinInterval, sub } from 'date-fns'
import type { ManagedCase } from '../../@types/managedCase'
import { parseIsoDate } from '../../utils/utils'

export default class CaseListUtils {
  public static isRecall(offender: ManagedCase): boolean {
    const recall = offender.nomisRecord?.recall && offender.nomisRecord.recall === true
    const crd = offender.nomisRecord?.conditionalReleaseDate
    const prrd = offender.nomisRecord?.postRecallReleaseDate

    // If a CRD but no PRRD it should NOT be treated as a recall
    if (crd && !prrd) {
      return false
    }

    if (crd && prrd) {
      const dateCrd = moment(offender.nomisRecord.conditionalReleaseDate, 'YYYY-MM-DD')
      const datePrrd = moment(offender.nomisRecord.postRecallReleaseDate, 'YYYY-MM-DD')
      // If the PRRD > CRD - it should be treated as a recall
      if (datePrrd.isAfter(dateCrd)) {
        return true
      }
      // If PRRD <= CRD - should not be treated as a recall
      return false
    }

    // Trust the Nomis recall flag as a fallback position - the above rules should always override
    return recall
  }

  public static isBreachOfTopUpSupervision = (offender: ManagedCase): boolean => {
    return offender.nomisRecord?.imprisonmentStatus && offender.nomisRecord?.imprisonmentStatus === 'BOTUS'
  }

  /**
   * Parole Eligibility Date must be set and in the future
   * If the date is in the past, it's no longer parole eligible
   * Parole eligibility excludes the offender, so a truthy return here is an exclusion from CVL
   * @param ped (yyyy-MM-dd format)
   */
  public static isParoleEligible(ped: string): boolean {
    if (!ped) return false
    const pedDate = parseIsoDate(ped)
    return isFuture(pedDate)
  }

  public static isEligibleEDS(ped: string, crd: string, ard: string, apd: string): boolean {
    if (!ped) return true // All EDSs have PEDs, so if no ped, not an EDS and can stop the check here
    if (!crd) return false // This should never be hit as a previous filter removes those without CRDs

    const crdDate = parseIsoDate(crd)
    const ardDate = ard ? parseIsoDate(ard) : undefined

    // if PED is in the future, they are OOS
    if (isFuture(parseIsoDate(ped))) return false

    // if ARD is not between CRD - 4 days and CRD (to account for bank holidays and weekends), then OOS
    if (ardDate && !isWithinInterval(ardDate, { start: sub(crdDate, { days: 4 }), end: crdDate })) {
      return false
    }

    // an APD with a PED in the past means they were a successful parole applicant on a later attempt, so are OOS
    if (apd) {
      return false
    }

    return true
  }
}
