import PrisonerService from '../../../services/prisonerService'
import CommunityService from '../../../services/communityService'

export default class ProbationerTeamSearchRoutes {
  constructor(private readonly prisonerService: PrisonerService, private readonly communityService: CommunityService) {}
}
