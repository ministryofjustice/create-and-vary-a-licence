import { RequestHandler } from 'express'
import path from 'path'
import LicenceService from '../../../services/licenceService'
import CommunityService from '../../../services/communityService'
import PrisonerService from '../../../services/prisonerService'
import { PrisonerSearchCriteria } from '../../../@types/prisonerSearchApiClientTypes'
import { SearchDto } from '../../../@types/probationSearchApiClientTypes'

export default class SpikeRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly communityService: CommunityService,
    private readonly prisonerService: PrisonerService
  ) {}

  public getStaffDetail: RequestHandler = async (req, res): Promise<void> => {
    const { user } = res.locals
    const staffDetail = await this.communityService.getStaffDetailByUsername(user.username)
    res.render('pages/staffDetail', { staffDetail })
  }

  public getPrisonerDetail: RequestHandler = async (req, res): Promise<void> => {
    const { user } = res.locals
    const { nomsId } = req.params
    const prisonerDetail = await this.prisonerService.getPrisonerDetail(nomsId, user)
    res.render('pages/prisonerDetail', { prisonerDetail })
  }

  public getStaffCaseload: RequestHandler = async (req, res): Promise<void> => {
    const { staffId } = req.params
    const staffIdentifier = staffId as unknown as number
    const managedOffenders = await this.communityService.getManagedOffenders(staffIdentifier)
    res.render('pages/managedOffenders', { managedOffenders })
  }

  public getPrisonerImage: RequestHandler = async (req, res): Promise<void> => {
    const { user } = res.locals
    const { nomsId } = req.params
    const placeHolder = path.join(process.cwd(), 'assets/images/image-missing.png')
    if (nomsId !== 'placeholder') {
      this.prisonerService
        .getPrisonerImage(nomsId, user)
        .then(data => {
          res.type('image/jpeg')
          data.pipe(res)
        })
        .catch(error => {
          res.sendFile(placeHolder)
        })
    } else {
      res.sendFile(placeHolder)
    }
  }

  public searchPrison: RequestHandler = async (req, res): Promise<void> => {
    const { firstName, lastName, prisonerIdentifier } = req.query as Record<string, string>
    const { user } = res.locals
    const searchValues = { firstName, lastName, prisonerIdentifier }

    if (!(prisonerIdentifier || firstName || lastName)) {
      return res.render('pages/prisoners')
    }

    const prisoners = await this.prisonerService.searchPrisoners(
      {
        firstName,
        lastName,
        prisonerIdentifier: prisonerIdentifier || null,
        // prisonIds - for prison user caseloads
        includeAliases: false,
      } as PrisonerSearchCriteria,
      user
    )

    return res.render('pages/prisoners', { prisoners, searchValues })
  }

  public searchProbation: RequestHandler = async (req, res): Promise<void> => {
    const { prisonerIdentifier, firstName, lastName, crn } = req.query as Record<string, string>
    const searchValues = { prisonerIdentifier, firstName, lastName, crn }

    if (!(prisonerIdentifier || firstName || lastName || crn)) {
      return res.render('pages/probationers')
    }

    const probationers = await this.communityService.searchProbationers({
      firstName,
      surname: lastName,
      nomsNumber: prisonerIdentifier || null,
      crn,
    } as SearchDto)

    return res.render('pages/probationers', { probationers, searchValues })
  }
}
