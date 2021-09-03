import { RequestHandler } from 'express'
import path from 'path'
import LicenceService from '../../../services/licenceService'
import CommunityService from '../../../services/communityService'
import PrisonerService from '../../../services/prisonerService'
import logger from '../../../../logger'

export default class SpikeRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly communityService: CommunityService,
    private readonly prisonerService: PrisonerService
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

  public getUserCaseload: RequestHandler = async (req, res): Promise<void> => {
    const { username } = res.locals.user
    const { staffId } = req.params // Get this from res.locals or leave in path?
    const staffIdentifier = staffId as unknown as number
    const managedOffenders = await this.communityService.getManagedOffenders(username, staffIdentifier)
    res.render('pages/managedOffenders', { managedOffenders })
  }

  public getCaseloadView: RequestHandler = async (req, res): Promise<void> => {
    const managedOffenders = this.licenceService.getManagedOffenders()
    const licences = this.licenceService.getLicencesForManagedOffenders()
    const offenderLicences = mergeByNomsId(managedOffenders, licences)
    logger.debug(`Offender licences to show:  ${JSON.stringify(offenderLicences)}`)
    res.render('pages/caseload', { offenderLicences })
  }
}

// Temporary - to mock the caseload view
const mergeByNomsId = (
  offenders: Record<string, unknown>[],
  licences: Record<string, unknown>[]
): Record<string, unknown>[] => {
  return offenders.map(offender => ({
    ...licences.find(licence => licence && (licence.nomsId === offender.nomsNumber || licence.crn === offender.crn)),
    ...offender,
  }))
}
