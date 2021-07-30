import { RequestHandler } from 'express'
import path from 'path'
import UserService from '../services/userService'
import LicenceService from '../services/licenceService'
import PrisonerService from '../services/prisonerService'
import CommunityService from '../services/communityService'

export default class OtherRoutes {
  constructor(
    private readonly userServiceService: UserService,
    private readonly prisonerService: PrisonerService,
    private readonly licenceService: LicenceService,
    private readonly communityService: CommunityService
  ) {}

  public listTestData: RequestHandler = async (req, res): Promise<void> => {
    const { username } = res.locals.user
    const testData = await this.licenceService.getTestData(username)
    res.render('pages/testData', { testData })
  }

  public getStaffDetail: RequestHandler = async (req, res): Promise<void> => {
    const { username } = res.locals.user
    const deliusUsername = req.params.username
    const staffDetail = await this.communityService.getStaffDetail(username, deliusUsername)
    res.render('pages/staffDetail', { staffDetail })
  }

  public getPrisonerDetail: RequestHandler = async (req, res): Promise<void> => {
    const { username } = res.locals.user
    const { nomsId } = req.params
    const prisonerDetail = await this.prisonerService.getPrisonerDetail(username, nomsId)
    res.render('pages/prisonerDetail', { prisonerDetail })
  }

  public getStaffCaseload: RequestHandler = async (req, res): Promise<void> => {
    const { username } = res.locals.user
    const { staffId } = req.params
    const staffIdentifier = staffId as unknown as number
    const managedOffenders = await this.communityService.getManagedOffenders(username, staffIdentifier)
    res.render('pages/managedOffenders', { managedOffenders })
  }

  public getPrisonerImage: RequestHandler = async (req, res): Promise<void> => {
    const { username } = res.locals.user
    const { nomsId } = req.params
    const placeHolder = path.join(process.cwd(), 'assets/images/image-missing.png')
    if (nomsId !== 'placeholder') {
      this.prisonerService
        .getPrisonerImage(username, nomsId)
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
}
