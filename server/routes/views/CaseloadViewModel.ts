import moment from 'moment'
import _ from 'lodash'
import { format } from 'date-fns'
import { Licence, ManagedCase } from '../../@types/managedCase'
import LicenceStatus from '../../enumeration/licenceStatus'
import { convertToTitleCase, parseIsoDate } from '../../utils/utils'
import LicenceKind from '../../enumeration/LicenceKind'
import config from '../../config'

export default (caseload: ManagedCase[], search: string) => {
  const now = new Date()
  return caseload
    .map(c => {
      const { licence, createLink } = findLicenceAndCreateLinkToDisplay(c)
      const releaseDate = parseIsoDate(c.nomisRecord.releaseDate || c.nomisRecord.conditionalReleaseDate)
      const { hardStopDate, hardStopWarningDate } = licence
      return {
        name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
        crnNumber: c.deliusRecord.offenderCrn,
        prisonerNumber: c.nomisRecord.prisonerNumber,
        releaseDate: format(releaseDate, 'dd MMM yyyy'),
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
        hardStopDate: format(hardStopDate, 'dd MMM yyyy'),
        showHardStopWarning: config.hardStopEnabled && hardStopWarningDate <= now && now < hardStopDate,
      }
    })
    .filter(c => {
      const searchString = search?.toLowerCase().trim()
      if (!searchString) return true
      return (
        c.crnNumber?.toLowerCase().includes(searchString) ||
        c.name.toLowerCase().includes(searchString) ||
        c.probationPractitioner?.name.toLowerCase().includes(searchString)
      )
    })
    .sort((a, b) => {
      const crd1 = moment(a.releaseDate, 'DD MMM YYYY').unix()
      const crd2 = moment(b.releaseDate, 'DD MMM YYYY').unix()
      return crd1 - crd2
    })
}

const findLicenceAndCreateLinkToDisplay = (c: ManagedCase): { licence: Licence; createLink: string } => {
  const timedOutLicence = c.licences.find(l => l.status === LicenceStatus.TIMED_OUT)
  const hardStopLicence = c.licences.find(l => l.kind === LicenceKind.HARD_STOP)

  if (timedOutLicence && timedOutLicence.versionOf) {
    return {
      licence: timedOutLicence,
      createLink: `/licence/create/id/${timedOutLicence.id}/licence-changes-not-approved-in-time`,
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
