import CommunityService from './communityService'
import PrisonerService from './prisonerService'
import { CommunityApiManagedOffender } from '../@types/communityClientTypes'
import { ManagedCase } from '../@types/managedCase'

export default class CaseloadService {
  constructor(private readonly prisonerService: PrisonerService, private readonly communityService: CommunityService) {}

  async getStaffCaseload(username: string): Promise<ManagedCase[]> {
    // TODO: Change this - How should we handle the error for when users do not have an account in delius?
    // TODO Cache the result in redis
    let managedOffenders: CommunityApiManagedOffender[]
    try {
      const { staffIdentifier } = await this.communityService.getStaffDetail(username)
      managedOffenders = await this.communityService.getManagedOffenders(staffIdentifier)
    } catch (e) {
      if (e.status === 404) {
        managedOffenders = []
      }
    }

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
