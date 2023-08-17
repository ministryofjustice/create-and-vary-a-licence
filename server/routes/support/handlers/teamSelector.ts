import { Request, Response } from 'express'
import CommunityService from '../../../services/communityService'
import { convertToTitleCase } from '../../../utils/utils'

export default class TeamSelectorRoutes {
  constructor(private readonly communityService: CommunityService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { teamName, teamCode, staffUsername } = req.query as Record<string, string>
    const { regionCode } = req.params
    const searchValues = { teamName, teamCode, staffUsername }

    if (Object.values(searchValues).every(x => !x || x === '')) {
      return res.render('pages/support/teamSelector')
    }

    const searchResults = (await this.communityService.getTeamsInRegion(regionCode, searchValues))
      .map(team => {
        return {
          teamName: convertToTitleCase(team.description),
          teamCode: team.code
        }
      })
      .sort((a, b) => {
        if (a.teamName < b.teamName) {
          return -1
        }
        if (a.teamName > b.teamName) {
          return 1
        }
        return 0
      })
    return res.render('pages/support/teamSelector', { searchResults, searchValues, regionCode })
  }
}
