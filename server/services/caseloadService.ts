import CommunityService from './communityService'
import PrisonerService from './prisonerService'
import { ManagedCase } from '../@types/managedCase'

export default class CaseloadService {
  constructor(private readonly prisonerService: PrisonerService, private readonly communityService: CommunityService) {}

  async getStaffCaseload(username: string): Promise<ManagedCase[]> {
    // TODO Cache the result in redis
    const { staffIdentifier } = await this.communityService.getStaffDetail(username)
    const managedOffenders = await this.communityService.getManagedOffenders(staffIdentifier)

    const caseloadNomisIds = managedOffenders
      .filter(offender => offender.currentOm)
      .filter(offender => offender.nomsNumber)
      .map(offender => offender.nomsNumber)

    return (await this.prisonerService.searchPrisonersByNomisIds(username, caseloadNomisIds))
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
      .filter(offender => !offender.indeterminateSentence)
      .filter(offender => !offender.paroleEligibilityDate)
      .filter(offender => offender.legalStatus !== 'DEAD')
  }
}
