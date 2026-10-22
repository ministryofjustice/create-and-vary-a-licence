import { escapeCsv } from '../../../utils/utils'
import { UpcomingReleasesWithMonitoringConditionsResponse } from '../../../@types/licenceApiClientTypes'

export const getCsvResponse = (cases: UpcomingReleasesWithMonitoringConditionsResponse[]) => {
  const header = [
    'Prison Number',
    'Name',
    'CRN',
    'Licence Status',
    'Ems conditions',
    'EM Types',
    'EM End Date',
    'Licence Start Date',
    'Licence Submitted Date',
  ]

  const csv = cases
    .map(upcomingCases => [
      upcomingCases.prisonNumber,
      upcomingCases.fullName,
      upcomingCases.crn,
      upcomingCases.status,
      escapeCsv(upcomingCases.emConditionCodes),
      escapeCsv(upcomingCases.electronicMonitoringTypes),
      upcomingCases.emEndDate,
      upcomingCases.licenceStartDate,
      upcomingCases.submittedDate,
    ])
    .map(row => row.join(','))
    .join('\n')
  return { header, csv }
}

export const mapReleasesWithMonitoring = (upcomingCases: UpcomingReleasesWithMonitoringConditionsResponse[]) => {
  return upcomingCases.map(upcomingCase => {
    return {
      crn: upcomingCase.crn,
      prisonNumber: upcomingCase.prisonNumber,
      status: upcomingCase.status,
      licenceStartDate: upcomingCase.licenceStartDate,
      submittedDate: upcomingCase.submittedDate,
      emConditionCodes: upcomingCase.emConditionCodes,
      fullName: upcomingCase.fullName,
      electronicMonitoringTypes: upcomingCase.electronicMonitoringTypes,
      emEndDate: upcomingCase.emEndDate,
    }
  })
}
