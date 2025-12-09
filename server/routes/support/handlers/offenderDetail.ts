import { Request, Response } from 'express'
import _ from 'lodash'
import moment from 'moment'
import PrisonerService from '../../../services/prisonerService'
import ProbationService from '../../../services/probationService'
import { convertToTitleCase, isHdcLicence } from '../../../utils/utils'
import LicenceService from '../../../services/licenceService'
import { Licence } from '../../../@types/licenceApiClientTypes'
import { nameToString } from '../../../data/deliusClient'

type LicenceDates = {
  crd: string
  ard: string
  ssd: string
  sed: string
  lsd: string
  led: string
  tussd: string
  tused: string
  hdcad: string
  hdcEndDate: string
  prrd: string
}

type CvlCom = {
  email: string
  username: string
  team: string
  lau: string
  pdu: string
  region: string
}

export default class OffenderDetailRoutes {
  constructor(
    private readonly prisonerService: PrisonerService,
    private readonly probationService: ProbationService,
    private readonly licenceService: LicenceService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { nomsId } = req.params
    const { prisoner: prisonerDetail, cvl: hardStopDetails } = await this.licenceService.getPrisonerDetail(nomsId, user)
    const probationPractitioner = await this.probationService.getResponsibleCommunityManager(nomsId)
    const hdcStatus = _.head(await this.prisonerService.getHdcStatuses([prisonerDetail], user))
    const conditionalReleaseDate = this.formatNomisDate(prisonerDetail.conditionalReleaseDate)
    const confirmedReleaseDate = this.formatNomisDate(prisonerDetail.confirmedReleaseDate)
    const postRecallReleaseDate = this.formatNomisDate(prisonerDetail.postRecallReleaseDate)
    const tused = this.formatNomisDate(prisonerDetail.topupSupervisionExpiryDate)
    const hdced = this.formatNomisDate(prisonerDetail.homeDetentionCurfewEligibilityDate)
    const hdcad = this.formatNomisDate(prisonerDetail.homeDetentionCurfewActualDate)
    const hdcEndDate = this.formatNomisDate(prisonerDetail.homeDetentionCurfewEndDate)
    const sentenceExpiryDate = this.formatNomisDate(prisonerDetail.sentenceExpiryDate)
    const licenceExpiryDate = this.formatNomisDate(prisonerDetail.licenceExpiryDate)
    const paroleEligibilityDate = this.formatNomisDate(prisonerDetail.paroleEligibilityDate)
    const actualParoleDate = this.formatNomisDate(prisonerDetail.actualParoleDate)

    const licenceSummary = await this.licenceService.getLatestLicenceByNomisIdsAndStatus([nomsId], [], user)
    const licence = licenceSummary ? await this.licenceService.getLicence(licenceSummary.licenceId, user) : null
    const ineligibilityReasons = await this.licenceService.getIneligibilityReasons(nomsId)
    const is91Status = await this.licenceService.getIS91Status(nomsId)

    res.render('pages/support/offenderDetail', {
      prisonerDetail: {
        ...prisonerDetail,
        name: (!!prisonerDetail && convertToTitleCase(`${prisonerDetail.firstName} ${prisonerDetail.lastName}`)) || '',
        crn: probationPractitioner?.case?.crn,
        conditionalReleaseDate,
        confirmedReleaseDate,
        postRecallReleaseDate,
        prisonId: prisonerDetail.prisonId !== 'OUT' ? prisonerDetail.prisonId : licence?.prisonCode,
        tused,
        hdced,
        hdcad,
        hdcEndDate,
        sentenceExpiryDate,
        licenceExpiryDate,
        paroleEligibilityDate,
        actualParoleDate,
        hardStop: {
          cutoffDate: hardStopDetails.hardStopDate,
          warningDate: hardStopDetails.hardStopWarningDate,
          isInHardStopPeriod: hardStopDetails.isInHardStopPeriod,
        },
        determinate: prisonerDetail.indeterminateSentence ? 'No' : 'Yes',
        dob: (!!prisonerDetail && moment(prisonerDetail.dateOfBirth).format('DD MMM YYYY')) || '',
        hdcStatus: hdcStatus ? hdcStatus?.approvalStatus : 'Not found',
        recall: prisonerDetail.recall ? 'Yes' : 'No',
      },
      probationPractitioner: {
        name: probationPractitioner ? nameToString(probationPractitioner.name) : 'Not allocated',
        staffCode: probationPractitioner?.code ?? '',
        email: probationPractitioner?.email ?? '',
        telephone: probationPractitioner?.telephoneNumber ?? '',
        team: probationPractitioner?.team?.description ?? '',
        teamCode: probationPractitioner?.team?.code ?? '',
        ldu: probationPractitioner?.team?.district?.description ?? '',
        lau: probationPractitioner?.team?.district?.description ?? '',
        pdu: probationPractitioner?.team?.borough?.description ?? '',
        region: probationPractitioner?.provider?.description ?? '',
      },
      cvlCom: this.getCvlComDetails(licence),
      licence: this.getLicenceDates(licence),
      ineligibilityReasons,
      is91Status: is91Status ? 'Yes' : 'No',
    })
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

  getLicenceDates = (licence: Licence): LicenceDates => {
    if (!licence) {
      return {
        crd: 'Not found',
        ard: 'Not found',
        ssd: 'Not found',
        sed: 'Not found',
        lsd: 'Not found',
        led: 'Not found',
        tussd: 'Not found',
        tused: 'Not found',
        hdcad: 'Not found',
        hdcEndDate: 'Not found',
        prrd: 'Not found',
      }
    }

    return {
      crd: this.formatLicenceDate(licence.conditionalReleaseDate),
      ard: this.formatLicenceDate(licence.actualReleaseDate),
      ssd: this.formatLicenceDate(licence.sentenceStartDate),
      sed: this.formatLicenceDate(licence.sentenceEndDate),
      lsd: this.formatLicenceDate(licence.licenceStartDate),
      led: this.formatLicenceDate(licence.licenceExpiryDate),
      tussd: this.formatLicenceDate(licence.topupSupervisionStartDate),
      tused: this.formatLicenceDate(licence.topupSupervisionExpiryDate),
      hdcad: isHdcLicence(licence) ? this.formatLicenceDate(licence.homeDetentionCurfewActualDate) : 'Not found',
      hdcEndDate: isHdcLicence(licence) ? this.formatLicenceDate(licence.homeDetentionCurfewEndDate) : 'Not found',
      prrd: this.formatLicenceDate(licence.postRecallReleaseDate),
    }
  }

  formatNomisDate = (dateToFormat: string): string => {
    return dateToFormat ? moment(dateToFormat, 'YYYY-MM-DD').format('DD MMM YYYY') : 'Not found'
  }

  formatLicenceDate = (dateToFormat: string): string => {
    return dateToFormat ? moment(dateToFormat, 'DD/MM/YYYY').format('DD MMM YYYY') : 'Not found'
  }
}
