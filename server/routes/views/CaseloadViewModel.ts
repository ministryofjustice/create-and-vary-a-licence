import moment from 'moment'
import _ from 'lodash'
import { Licence, ManagedCase } from '../../@types/managedCase'
import LicenceStatus from '../../enumeration/licenceStatus'
import { convertToTitleCase } from '../../utils/utils'
import LicenceKind from '../../enumeration/LicenceKind'

export default (caseload: ManagedCase[], search: string) => {
  return caseload
    .map(c => {
      const licence =
        c.licences.length > 1 ? c.licences.find(l => l.status !== LicenceStatus.APPROVED) : _.head(c.licences)

      return {
        name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
        crnNumber: c.deliusRecord.offenderCrn,
        prisonerNumber: c.nomisRecord.prisonerNumber,
        releaseDate: moment(c.nomisRecord.releaseDate || c.nomisRecord.conditionalReleaseDate).format('DD MMM YYYY'),
        licenceId: licence.id,
        licenceStatus: licence.status,
        licenceType: licence.type,
        probationPractitioner: c.probationPractitioner,
        createLink: buildCreateLink(c.nomisRecord.prisonerNumber, licence),
        isClickable:
          c.probationPractitioner !== undefined &&
          licence.status !== LicenceStatus.NOT_IN_PILOT &&
          licence.status !== LicenceStatus.OOS_RECALL &&
          licence.status !== LicenceStatus.OOS_BOTUS,
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

const buildCreateLink = (prisonerNumber: string, licence: Licence) => {
  if (licence.status === LicenceStatus.TIMED_OUT) {
    if (licence.versionOf) {
      return `/licence/create/id/${licence.id}/licence-changes-not-approved-in-time`
    }
    return `/licence/create/nomisId/${prisonerNumber}/prison-will-create-this-licence`
  }

  if (!licence.id) {
    return `/licence/create/nomisId/${prisonerNumber}/confirm`
  }

  if (licence.kind === LicenceKind.HARD_STOP) {
    return `/licence/create/id/${licence.id}/licence-created-by-prison`
  }

  return `/licence/create/id/${licence.id}/check-your-answers`
}
