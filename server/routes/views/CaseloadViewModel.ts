import _ from 'lodash'
import { format } from 'date-fns'
import { Licence, ManagedCase } from '../../@types/managedCase'
import LicenceStatus from '../../enumeration/licenceStatus'
import { convertToTitleCase, parseIsoDate } from '../../utils/utils'
import LicenceKind from '../../enumeration/LicenceKind'

export default (caseload: ManagedCase[]) => {
  return caseload
    .map(c => {
      const { licence, createLink } = findLicenceAndCreateLinkToDisplay(c)
      const releaseDateString = c.nomisRecord.releaseDate || c.nomisRecord.conditionalReleaseDate
      const releaseDate = releaseDateString && parseIsoDate(releaseDateString)
      const { hardStopDate, hardStopWarningDate } = licence
      return {
        name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
        crnNumber: c.deliusRecord.offenderCrn,
        prisonerNumber: c.nomisRecord.prisonerNumber,
        releaseDate: releaseDate && format(releaseDate, 'dd MMM yyyy'),
        sortDate: releaseDate,
        licenceId: licence.id,
        licenceStatus: licence.status,
        licenceType: licence.type,
        probationPractitioner: c.probationPractitioner,
        createLink,
        isClickable:
          c.probationPractitioner !== undefined &&
          licence.status !== LicenceStatus.NOT_IN_PILOT &&
          licence.status !== LicenceStatus.OOS_RECALL &&
          licence.status !== LicenceStatus.OOS_BOTUS,
        hardStopDate: hardStopDate && format(hardStopDate, 'dd/MM/yyyy'),
        hardStopWarningDate: hardStopWarningDate && format(hardStopWarningDate, 'dd/MM/yyyy'),
        kind: licence.kind,
        isDueForEarlyRelease: c.cvlFields?.isDueForEarlyRelease,
      }
    })
    .sort((a, b) => {
      return (a.sortDate?.getTime() || 0) - (b.sortDate?.getTime() || 0)
    })
}

const findLicenceAndCreateLinkToDisplay = (c: ManagedCase): { licence: Licence; createLink: string } => {
  const timedOutLicence = c.licences.find(l => l.status === LicenceStatus.TIMED_OUT)
  const hardStopLicence = c.licences.find(l => l.kind === LicenceKind.HARD_STOP)

  if (timedOutLicence && timedOutLicence.versionOf) {
    const previouslyApproved = c.licences.find(l => l.id === timedOutLicence.versionOf)
    return {
      licence: { ...previouslyApproved, status: LicenceStatus.TIMED_OUT },
      createLink: `/licence/create/id/${previouslyApproved.id}/licence-changes-not-approved-in-time`,
    }
  }
  if (
    (timedOutLicence && !hardStopLicence) ||
    (hardStopLicence && hardStopLicence.status === LicenceStatus.IN_PROGRESS)
  ) {
    return {
      licence: timedOutLicence || { ...hardStopLicence, status: LicenceStatus.TIMED_OUT },
      createLink: `/licence/create/nomisId/${c.nomisRecord.prisonerNumber}/prison-will-create-this-licence`,
    }
  }
  if (hardStopLicence) {
    return {
      licence: { ...hardStopLicence, status: LicenceStatus.TIMED_OUT },
      createLink: `/licence/create/id/${hardStopLicence.id}/licence-created-by-prison`,
    }
  }

  const licence = c.licences.length > 1 ? c.licences.find(l => l.status !== LicenceStatus.APPROVED) : _.head(c.licences)

  if (!licence.id) {
    return { licence, createLink: `/licence/create/nomisId/${c.nomisRecord.prisonerNumber}/confirm` }
  }

  return { licence, createLink: `/licence/create/id/${licence.id}/check-your-answers` }
}
