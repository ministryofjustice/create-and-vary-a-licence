import { subDays } from 'date-fns'

import Container from '../server/services/container'
import { ManagedCase } from '../server/@types/managedCase'
import LicenceStatus from '../server/enumeration/licenceStatus'
import PrisonerService from '../server/services/prisonerService'
import CaseloadService from '../server/services/caseloadService'

export default class PromptLicenceCreationService {
  constructor(private readonly prisonerService: PrisonerService, private readonly caseloadService: CaseloadService) {}

  pollPrisonersDueForLicence = async (
    earliestReleaseDate: Date,
    latestReleaseDate: Date,
    licenceStatus: LicenceStatus[]
  ): Promise<ManagedCase[]> => {
    // TODO remove hard coded list and revert back to config from 5th December 2022
    const prisonCodes = [
      'CFI',
      'SWI',
      'UKI',
      'UPI',
      'PRI',
      'FHI',
      'LCI',
      'LII',
      'LGI',
      'MHI',
      'NSI',
      'NMI',
      'RNI',
      'SKI',
      'SUI',
      'WTI',
      'DTI',
      'DMI',
      'HHI',
      'KVI',
      'NLI',
      'LNI',
      'FKI',
      'GHI',
      'STI',
      'LPI',
      'PNI',
      'RSI',
      'TCI',
      'HVI',
      'KMI',
      'LFI',
      'WMI',
      'ACI',
      'BMI',
      'SFI',
      'DHI',
      'SHI',
      'BSI',
      'HEI',
      'DGI',
      'OWI',
      'SNI',
      'ONI',
      'RHI',
      'FSI',
      'LLI',
      'BWI',
      'AGI',
      'DNI',
      'FNI',
      'HDI',
      'HLI',
      'HMI',
      'LEI',
      'LHI',
      'MDI',
      'NHI',
      'WEI',
      'WDI',
      'BCI',
      'FBI',
      'HII',
      'MRI',
      'ASI',
      'BLI',
      'CWI',
      'DAI',
      'EEI',
      'EWI',
      'EXI',
      'GMI',
      'LYI',
      'PDI',
      'VEI',
    ]

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
