import CommunityService from '../communityService'
import { User } from '../../@types/CvlUserDetails'
import type { ApprovalCase } from '../../@types/licenceApiClientTypes'
import { LicenceApiClient } from '../../data'

export default class ApproverCaseloadService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async getApprovalNeeded(user: User, prisonCaseload: string[], searchString: string): Promise<ApprovalCase[]> {
    const caseLoad: ApprovalCase[] = await this.licenceApiClient.getApprovalCaseload(prisonCaseload, user)
    return this.applySearch(searchString, caseLoad)
  }

  async getRecentlyApproved(user: User, prisonCaseload: string[], searchString: string): Promise<ApprovalCase[]> {
    const caseLoad: ApprovalCase[] = await this.licenceApiClient.getRecentlyApprovedCaseload(prisonCaseload, user)
    return this.applySearch(searchString, caseLoad)
  }

  applySearch(searchString: string, cases: ApprovalCase[]): ApprovalCase[] {
    if (!searchString) return cases
    const term = searchString?.toLowerCase()
    return cases.filter(c => {
      return (
        c.name.toLowerCase().includes(term) ||
        c.prisonerNumber?.toLowerCase().includes(term) ||
        c.probationPractitioner?.name.toLowerCase().includes(term)
      )
    })
  }
}
