import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import ProbationService from '../../../services/probationService'
import { nameToString } from '../../../data/deliusClient'
import { convertToTitleCase } from '../../../utils/utils'
import { Licence } from '../../../@types/licenceApiClientTypes'

type CvlCom = {
  email: string
  username: string
  team: string
  lau: string
  pdu: string
  region: string
}

export default class OffenderAllocationRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly probationService: ProbationService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { nomsId } = req.params

    const { prisoner: prisonerDetail } = await this.licenceService.getPrisonerDetail(nomsId, user)
    const probationPractitioner = await this.probationService.getResponsibleCommunityManager(nomsId)

    const licenceSummary = await this.licenceService.getLatestLicenceByNomisIdsAndStatus([nomsId], [], user)
    const licence = licenceSummary ? await this.licenceService.getLicence(licenceSummary.licenceId, user) : null

    res.render('pages/support/offenderAllocation', {
      crn: probationPractitioner.case?.crn,
      offenderName: convertToTitleCase(`${prisonerDetail.firstName} ${prisonerDetail.lastName}`),
      probationPractitioner: {
        name: probationPractitioner ? nameToString(probationPractitioner.name) : '',
        staffCode: probationPractitioner?.code,
        email: probationPractitioner?.email,
        telephone: probationPractitioner?.telephoneNumber,
        team: probationPractitioner?.team?.description,
        teamCode: probationPractitioner?.team?.code,
        ldu: probationPractitioner?.team?.district?.description,
        lau: probationPractitioner?.team?.district?.description,
        pdu: probationPractitioner?.team?.borough?.description,
        region: probationPractitioner?.provider?.description,
      },
      cvlCom: this.getCvlComDetails(licence),
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { nomsId } = req.params
    const { user } = res.locals

    const probationPractitioner = await this.probationService.getResponsibleCommunityManager(nomsId)
    await this.licenceService.syncComAllocation(probationPractitioner.case?.crn, user)
    return res.redirect(`/support/offender/${nomsId}/detail`)
  }

  getCvlComDetails = (licence: Licence): CvlCom => {
    if (!licence) {
      return {
        email: 'Not found',
        username: 'Not found',
        team: 'Not found',
        lau: 'Not found',
        pdu: 'Not found',
        region: 'Not found',
      }
    }

    return {
      email: licence.comEmail || 'Not found',
      username: licence.comUsername || 'Not found',
      team: licence.probationTeamDescription || 'Not found',
      lau: licence.probationLauDescription || 'Not found',
      pdu: licence.probationPduDescription || 'Not found',
      region: licence.probationAreaDescription || 'Not found',
    }
  }
}
