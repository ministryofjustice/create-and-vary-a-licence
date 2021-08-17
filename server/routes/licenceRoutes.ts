import { RequestHandler, Request, Response, NextFunction } from 'express'

import UserService from '../services/userService'
import PrisonerService from '../services/prisonerService'
import LicenceService from '../services/licenceService'
import CommunityService from '../services/communityService'

import config from '../config'
import logger from '../../logger'

import { pdfOptions, getHeader, getFooter } from '../utils/pdfFormat'

// Stubbed licence detail initially
const licence = {
  licenceId: 1,
  licenceType: 'AP',
  lastName: 'Harrison',
  firstName: 'Tim',
  dateOfBirth: '11/02/1970',
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
    const headerHtml = getHeader(licence)
    const footerHtml = getFooter(licence)
    logger.info(`Request to preview licence ${id} from user ${username}`)
    // No licencesUrl specified, so it defaults to empty, and references assets locally at /assets
    res.render(`pages/licence/preview`, { licence, headerHtml, footerHtml })
  }

  public renderPdfLicence: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { username } = res.locals.user
    const { id } = req.params
    logger.info(`Request to print PDF for licence ${id} from user ${username}`)
    const filename = licence.nomsId ? `${licence.nomsId}.pdf` : `${licence.lastName}.pdf`
    const headerHtml = getHeader(licence)
    const footerHtml = getFooter(licence)
    // Specify licencesUrl so that it is used in the NJK template as http://host.docker.internal:3000/assets
    const { licencesUrl } = config.apis.gotenberg
    res.renderPDF(
      `pages/licence/preview`,
      { licencesUrl, licence },
      { filename, pdfOptions: { ...pdfOptions, headerHtml, footerHtml } }
    )
  }

  public getCaseloadForLicenceCreation: RequestHandler = async (req, res): Promise<void> => {
    const caseload = [
      {
        name: 'Adam Balasaravika',
        crnNumber: 'X381306',
        conditionalReleaseDate: '03 August 2022',
      },
    ]
    res.render('pages/create/caseload', { caseload })
  }

  public getInitialMeetingPerson: RequestHandler = async (req, res): Promise<void> => {
    const offender = {
      name: 'Adam Balasaravika',
    }
    res.render('pages/create/initialMeetingPerson', { offender })
  }

  public postInitialMeetingPerson: RequestHandler = async (req, res): Promise<void> => {
    const id = 1
    res.redirect(`/licence/create/id/${id}/initial-meeting-place`)
  }

  public getInitialMeetingPlace: RequestHandler = async (req, res): Promise<void> => {
    const offender = {
      name: 'Adam Balasaravika',
    }
    res.render('pages/create/initialMeetingPlace', { offender })
  }

  public postInitialMeetingPlace: RequestHandler = async (req, res): Promise<void> => {
    const { id } = req.params
    res.redirect(`/licence/create/id/${id}/initial-meeting-contact`)
  }

  public getInitialMeetingContact: RequestHandler = async (req, res): Promise<void> => {
    res.render('pages/create/initialMeetingContact', {})
  }

  public postInitialMeetingContact: RequestHandler = async (req, res): Promise<void> => {
    const { id } = req.params
    res.redirect(`/licence/create/id/${id}/initial-meeting-time`)
  }

  public getInitialMeetingTime: RequestHandler = async (req, res): Promise<void> => {
    const offender = {
      name: 'Adam Balasaravika',
    }
    res.render('pages/create/initialMeetingTime', { offender })
  }

  public postInitialMeetingTime: RequestHandler = async (req, res): Promise<void> => {
    const { id } = req.params
    res.redirect(`/licence/create/id/${id}/additional-conditions-question`)
  }

  public getAdditionalConditionsQuestion: RequestHandler = async (req, res): Promise<void> => {
    const offender = {
      name: 'Adam Balasaravika',
    }
    res.render('pages/create/additionalConditionsQuestion', { offender })
  }

  public postAdditionalConditionsQuestion: RequestHandler = async (req, res): Promise<void> => {
    const { id } = req.params
    const payload = req.body
    if (payload['additional-conditions-required'] === 'yes') {
      res.redirect(`/licence/create/id/${id}/additional-conditions`)
    } else {
      res.redirect(`/licence/create/id/${id}/bespoke-conditions-question`)
    }
  }

  public getAdditionalConditions: RequestHandler = async (req, res): Promise<void> => {
    const offender = {
      name: 'Adam Balasaravika',
    }
    res.render('pages/create/additionalConditions', { offender })
  }

  public postAdditionalConditions: RequestHandler = async (req, res): Promise<void> => {
    const { id } = req.params
    res.redirect(`/licence/create/id/${id}/bespoke-conditions-question`)
  }

  public getBespokeConditionsQuestion: RequestHandler = async (req, res): Promise<void> => {
    const offender = {
      name: 'Adam Balasaravika',
    }
    res.render('pages/create/bespokeConditionsQuestion', { offender })
  }

  public postBespokeConditionsQuestion: RequestHandler = async (req, res): Promise<void> => {
    const { id } = req.params
    const payload = req.body
    if (payload['bespoke-conditions-required'] === 'yes') {
      res.redirect(`/licence/create/id/${id}/bespoke-conditions`)
    } else {
      res.redirect(`/licence/create/id/${id}/check-your-answers`)
    }
  }

  public getBespokeConditions: RequestHandler = async (req, res): Promise<void> => {
    const offender = {
      name: 'Adam Balasaravika',
    }
    res.render('pages/create/bespokeConditions', { offender })
  }

  public postBespokeConditions: RequestHandler = async (req, res): Promise<void> => {
    // TODO: Some work to do here to redirect to the same page if "Add another" or "Remove" is selected and javascript is turned off browserside
    const { id } = req.params
    res.redirect(`/licence/create/id/${id}/check-your-answers`)
  }

  public getCheckAnswers: RequestHandler = async (req, res): Promise<void> => {
    const mockLicence = this.licenceService.getLicence()
    res.render('pages/create/checkAnswers', { licence: mockLicence })
  }

  public postCheckAnswers: RequestHandler = async (req, res): Promise<void> => {
    const { id } = req.params
    res.redirect(`/licence/create/id/${id}/confirmation`)
  }

  public getConfirmation: RequestHandler = async (req, res): Promise<void> => {
    const offender = {
      name: 'Adam Balasaravika',
      prison: 'Brixton Prison',
    }
    res.render('pages/create/confirmation', { offender })
  }
}
