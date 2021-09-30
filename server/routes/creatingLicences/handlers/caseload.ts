import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import CommunityService from '../../../services/communityService'
import { CommunityApiManagedOffender } from '../../../data/communityClientTypes'

export default class CaseloadRoutes {
  constructor(private readonly licenceService: LicenceService, private readonly communityService: CommunityService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    // TODO: Change this - How should we handle the error for when users do not have an account in delius?
    let managedOffenders: CommunityApiManagedOffender[]
    try {
      const { staffIdentifier } = await this.communityService.getStaffDetail(res.locals.user.username)
      managedOffenders = await this.communityService.getManagedOffenders(staffIdentifier)
    } catch (e) {
      if (e.status === 404) {
        managedOffenders = []
      }
    }
    const caseload = managedOffenders
      .filter(offender => offender.currentOm)
      .map(offender => {
        return {
          name: offender.offenderSurname,
          crnNumber: offender.crnNumber,
          conditionalReleaseDate: '03 August 2022', // TODO: Get conditionalReleaseDate from nomis??
        }
      })
    // TODO: Remove the below stubbed case when we have set up users in delius with a real caseload
    caseload.push({
      name: 'Adam Balasaravika',
      crnNumber: 'X344165',
      conditionalReleaseDate: '03 August 2022',
    })
    res.render('pages/create/caseload', { caseload })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { username } = res.locals.user
    // TODO: Populate licence with real data from nomis/delius
    const { licenceId } = await this.licenceService.createLicence(username)
    res.redirect(`/licence/create/id/${licenceId}/initial-meeting-name`)
  }
}
