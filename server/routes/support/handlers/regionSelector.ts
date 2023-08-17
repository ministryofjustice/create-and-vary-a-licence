import { Request, Response } from 'express'
import CommunityService from '../../../services/communityService'
import config from '../../../config'

export default class RegionSelectorRoutes {
  constructor(
    private readonly communityService: CommunityService
  ){}

  GET = async(req: Request, res: Response) => {
    const regions = config.rollout.probationAreas

    res.render('pages/support/regionSelector', {regions})
  }

  POST = async(req: Request, res: Response) => {
    const { regionCode } = req.body

    res.redirect(`/support/region/${regionCode}/teams`)
  }
}