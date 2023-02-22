import { format } from 'date-fns'
import logger from '../../logger'
import { Licence } from '../@types/licenceApiClientTypes'
import { Prisoner } from '../@types/prisonerSearchApiClientTypes'
import { toDateString } from '../utils/utils'

export const getReleaseDateFromNomis = (nomisRecord: Prisoner): string => {
  let dateString = nomisRecord.conditionalReleaseDate

  if (nomisRecord.confirmedReleaseDate) {
    dateString = nomisRecord.confirmedReleaseDate
  }

  if (nomisRecord.conditionalReleaseOverrideDate) {
    dateString = nomisRecord.conditionalReleaseOverrideDate
  }

  if (!dateString) {
    return 'not found'
  }

  try {
    dateString = format(new Date(dateString), 'dd MMM yyyy')
  } catch (e) {
    logger.error(
      `Invalid date error: ${e.message} for prisonerNumber: ${nomisRecord.prisonerNumber} using date: ${dateString}`
    )
  }

  return dateString
}

export const getReleaseDateFromLicence = (licence: Licence) => {
  let dateString = licence.actualReleaseDate || licence.conditionalReleaseDate

  if (!dateString) {
    logger.error(`No release date found for NOMIS ID: ${licence.nomsId}`)
    return 'not found'
  }

  dateString = format(new Date(toDateString(dateString)), 'dd MMM yyyy')

  return dateString
}
