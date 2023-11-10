import moment from 'moment'
import _ from 'lodash'
import { ManagedCase } from '../../@types/managedCase'
import LicenceStatus from '../../enumeration/licenceStatus'
import { convertToTitleCase } from '../../utils/utils'

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
