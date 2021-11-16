import moment from 'moment'
import CommunityService from './communityService'
import PrisonerService from './prisonerService'
import LicenceService from './licenceService'
import { ManagedCase } from '../@types/managedCase'
import LicenceStatus from '../enumeration/licenceStatus'
import logger from '../../logger'

export default class CaseloadService {
  constructor(
    private readonly prisonerService: PrisonerService,
    private readonly communityService: CommunityService,
    private readonly licenceService: LicenceService
  ) {}

  async getStaffCaseload(username: string, staffIdentifier: number): Promise<ManagedCase[]> {
    // TODO: We could cache the entire caseload here?
    const managedOffenders = await this.communityService.getManagedOffenders(staffIdentifier)
    const caseloadNomisIds = managedOffenders
      .filter(offender => offender.currentOm)
      .filter(offender => offender.nomsNumber)
      .map(offender => offender.nomsNumber)

    logger.info(`Caseload from Delius = ${JSON.stringify(caseloadNomisIds)}`)

    /*
     TODO: Maybe this should be checking for existing licences by nomisId rather than staffId? What if the offender
      changes their managing officer after a licence has been created for them?
     */
    const existingLicences = await this.licenceService.getLicencesByStaffIdAndStatus(staffIdentifier, username, [
      LicenceStatus.ACTIVE,
      LicenceStatus.INACTIVE,
      LicenceStatus.RECALLED,
    ])

    logger.info(`Existing licences = ${JSON.stringify(existingLicences)}`)

    // Get the matching offenders for these Nomis IDs
    const offenders = await this.prisonerService.searchPrisonersByNomisIds(username, caseloadNomisIds)

    const matchingBull = offenders.find(o => o.prisonerNumber === 'A8082DY')
    logger.info(`A8082DY = ${JSON.stringify(matchingBull)}`)

    // Get the HDC status for each offender in the caseload list
    const hdcStatuses = await this.prisonerService.getHdcStatuses(username, offenders)

    return offenders
      .map(offender => {
        const matchingDeliusCase = managedOffenders.find(
          deliusCase => deliusCase.nomsNumber === offender.prisonerNumber
        )
        if (!matchingDeliusCase) {
          return null
        }
        return {
          ...matchingDeliusCase,
          ...offender,
        } as ManagedCase
      })
      .filter(offender => offender)
      .filter(offender => !offender.paroleEligibilityDate)
      .filter(offender => offender.legalStatus !== 'DEAD')
      .filter(offender => offender.status && offender.status.startsWith('ACTIVE'))
      .filter(offender => !offender.indeterminateSentence && offender.conditionalReleaseDate)
      .filter(offender => !offender.releaseDate || moment().isBefore(moment(offender.releaseDate, 'YYYY-MM-DD')))
      .filter(offender => {
        const hdcStatus = hdcStatuses.find(hdc => hdc.bookingId === offender.bookingId)
        return !hdcStatus.eligibleForHdc
      })
      .filter(offender => {
        const existingLicence = existingLicences.find(licence => licence.nomisId === offender.nomsNumber)
        return !existingLicence
      })
      .sort((a, b) => {
        const crd1 = moment(a.conditionalReleaseDate, 'YYYY-MM-DD').unix()
        const crd2 = moment(b.conditionalReleaseDate, 'YYYY-MM-DD').unix()
        return crd1 - crd2
      })
  }
}
