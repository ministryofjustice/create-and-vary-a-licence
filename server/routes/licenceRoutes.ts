import { RequestHandler, Request, Response, NextFunction } from 'express'

import UserService from '../services/userService'
import PrisonerService from '../services/prisonerService'
import LicenceService from '../services/licenceService'
import CommunityService from '../services/communityService'

import config from '../config'
import logger from '../../logger'

import { pdfOptions, footerHtml } from '../utils/pdfFormat'

// Stubbed licence detail initially
const licence = {
  licenceId: 1,
  licenceType: 'AP',
  lastName: 'Harrison',
  firstName: 'Tim',
  prisonId: 'MDI',
  prisonDescription: 'HMP Moorland',
  roLastName: 'Smith',
  roFirstName: 'Sarah',
  roEmail: 'sarah.smith@nps.north.gov.uk',
  roTelephone: '0161 234 234',
  nomsId: 'A1234AG',
  pnc: '2015/1234344',
}

export default class LicenceRoutes {
  constructor(
    private readonly userServiceService: UserService,
    private readonly prisonerService: PrisonerService,
    private readonly licenceService: LicenceService,
    private readonly communityService: CommunityService
  ) {}

  public getUserCaseload: RequestHandler = async (req, res): Promise<void> => {
    const { username } = res.locals.user
    const { staffId } = req.params // Get this from res.locals or leave in path?
    const staffIdentifier = staffId as unknown as number
    const managedOffenders = await this.communityService.getManagedOffenders(username, staffIdentifier)
    res.render('pages/managedOffenders', { managedOffenders })
  }

  public previewLicence: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { username } = res.locals.user
    const { id } = req.params
    logger.info(`Request to preview licence ${id} from user ${username}`)
    // No licencesUrl specified, so it defaults to empty, and references assets at /assets
    res.render(`pages/licence/preview`, { licence })
  }

  public renderPdfLicence: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { username } = res.locals.user
    const { id } = req.params
    logger.info(`Request to print PDF for licence ${id} from user ${username}`)
    const filename = 'generated-file.pdf'
    // There is a value for the licencesUrl so this is used in the template as http://10.0.2.5:3000/assets ..
    const { licencesUrl } = config.apis.gotenberg
    res.renderPDF(
      `pages/licence/preview`,
      { licencesUrl, licence },
      { filename, pdfOptions: { ...pdfOptions, footerHtml } }
    )
  }
}
