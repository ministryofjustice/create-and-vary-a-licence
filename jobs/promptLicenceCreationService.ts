import { subDays } from 'date-fns'

import config from '../server/config'
import Container from '../server/services/container'
import { ManagedCase } from '../server/@types/managedCase'
import LicenceStatus from '../server/enumeration/licenceStatus'
import PrisonerService from '../server/services/prisonerService'
import CaseloadService from '../server/services/caseloadService'

export default class PromptLicenceCreationService {
  constructor(
    private readonly prisonerService: PrisonerService,
    private readonly caseloadService: CaseloadService
  ) {}

  pollPrisonersDueForLicence = async (
    earliestReleaseDate: Date,
    latestReleaseDate: Date,
    licenceStatus: LicenceStatus[]
  ): Promise<ManagedCase[]> => {
    const prisonCodes = config.rollout.prisons

    return this.prisonerService
      .searchPrisonersByReleaseDate(earliestReleaseDate, latestReleaseDate, prisonCodes)
      .then(prisoners => prisoners.filter(offender => offender.status && offender.status.startsWith('ACTIVE')))
      .then(caseload => new Container(caseload))
      .then(caseload => this.caseloadService.pairNomisRecordsWithDelius(caseload))
      .then(caseload => this.caseloadService.filterOffendersEligibleForLicence(caseload))
      .then(prisoners => this.caseloadService.mapOffendersToLicences(prisoners))
      .then(caseload => caseload.unwrap())
      .then(prisoners =>
        prisoners.filter(offender => licenceStatus.some(status => offender.licences.find(l => l.status === status)))
      )
  }

  excludeCasesNotAssignedToPpWithinPast7Days = (caseload: ManagedCase[]): ManagedCase[] => {
    const startOf7Days = subDays(new Date(), 7)
    const endOf7Days = new Date()
    const isWithinPast7Days = (c: ManagedCase) => {
      if (c.deliusRecord.offenderManagers) {
        const dateAllocatedToPp = new Date(c.deliusRecord.offenderManagers.find(om => om.active).fromDate)
        return dateAllocatedToPp >= startOf7Days && dateAllocatedToPp < endOf7Days
      }
      return false
    }

    return caseload.filter(isWithinPast7Days)
  }
}
