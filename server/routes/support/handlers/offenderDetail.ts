import { Request, Response } from 'express'
import _ from 'lodash'
import moment from 'moment'
import PrisonerService from '../../../services/prisonerService'
import CommunityService from '../../../services/communityService'
import { convertToTitleCase } from '../../../utils/utils'
import LicenceService from '../../../services/licenceService'
import { User } from '../../../@types/CvlUserDetails'

type LicenceDates = {
  crd: string
  ard: string
  ssd: string
  sed: string
  led: string
  tussd: string
  tused: string
}

export default class OffenderDetailRoutes {
  constructor(
    private readonly prisonerService: PrisonerService,
    private readonly communityService: CommunityService,
    private readonly licenceServer: LicenceService
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { nomsId } = req.params
    const prisonerDetail = _.head(await this.prisonerService.searchPrisonersByNomisIds([nomsId], user))
    const deliusRecord = _.head(await this.communityService.searchProbationers({ nomsNumber: nomsId }))
    const probationPractitioner = deliusRecord?.offenderManagers.find(com => com.active)
    const probationPractitionerContact = probationPractitioner
      ? await this.communityService.getStaffDetailByStaffCode(probationPractitioner?.staff.code)
      : undefined
    const hdcStatus = _.head(await this.prisonerService.getHdcStatuses([prisonerDetail], user))
    const conditionalReleaseDate = this.formatNomisDate(prisonerDetail.conditionalReleaseDate)
    const confirmedReleaseDate = this.formatNomisDate(prisonerDetail.confirmedReleaseDate)
    const postRecallReleaseDate = this.formatNomisDate(prisonerDetail.postRecallReleaseDate)
    const tused = this.formatNomisDate(prisonerDetail.topupSupervisionExpiryDate)
    const hdced = this.formatNomisDate(prisonerDetail.homeDetentionCurfewEligibilityDate)
    const sentenceExpiryDate = this.formatNomisDate(prisonerDetail.sentenceExpiryDate)
    const licenceExpiryDate = this.formatNomisDate(prisonerDetail.licenceExpiryDate)
    const paroleEligibilityDate = this.formatNomisDate(prisonerDetail.paroleEligibilityDate)

    res.render('pages/support/offenderDetail', {
      prisonerDetail: {
        ...prisonerDetail,
        name: convertToTitleCase(`${prisonerDetail.firstName} ${prisonerDetail.lastName}`),
        crn: deliusRecord?.otherIds.crn,
        conditionalReleaseDate,
        confirmedReleaseDate,
        postRecallReleaseDate,
        tused,
        hdced,
        sentenceExpiryDate,
        licenceExpiryDate,
        paroleEligibilityDate,
        determinate: prisonerDetail.indeterminateSentence ? 'No' : 'Yes',
        dob: moment(prisonerDetail.dateOfBirth).format('DD MMM YYYY'),
        hdcStatus: hdcStatus ? hdcStatus?.approvalStatus : 'Not found',
        recall: prisonerDetail.recall ? 'Yes' : 'No',
      },
      probationPractitioner: {
        name: probationPractitioner
          ? `${probationPractitioner.staff.forenames} ${probationPractitioner.staff.surname}`
          : '',
        email: probationPractitionerContact?.email,
        telephone: probationPractitionerContact?.telephoneNumber,
        team: probationPractitioner?.team?.description,
        ldu: probationPractitioner?.team?.localDeliveryUnit?.description,
        lau: probationPractitioner?.team?.district?.description,
        pdu: probationPractitioner?.team?.borough?.description,
        region: probationPractitioner?.probationArea?.description,
      },
      licence: await this.getLicenceDates(nomsId, user),
    })
  }

  getLicenceDates = async (nomsId: string, user: User): Promise<LicenceDates> => {
    const licenceSummary = await this.licenceServer.getLatestLicenceByNomisIdsAndStatus([nomsId], [], user)

    if (!licenceSummary) {
      return {
        crd: 'Not found',
        ard: 'Not found',
        ssd: 'Not found',
        sed: 'Not found',
        led: 'Not found',
        tussd: 'Not found',
        tused: 'Not found',
      }
    }

    const licence = await this.licenceServer.getLicence(licenceSummary.licenceId.toString(), user)

    return {
      crd: this.formatLicenceDate(licence.conditionalReleaseDate),
      ard: this.formatLicenceDate(licence.actualReleaseDate),
      ssd: this.formatLicenceDate(licence.sentenceStartDate),
      sed: this.formatLicenceDate(licence.sentenceEndDate),
      led: this.formatLicenceDate(licence.licenceExpiryDate),
      tussd: this.formatLicenceDate(licence.topupSupervisionStartDate),
      tused: this.formatLicenceDate(licence.topupSupervisionExpiryDate),
    }
  }

  formatNomisDate = (dateToFormat: string): string => {
    return dateToFormat ? moment(dateToFormat, 'YYYY-MM-DD').format('DD MMM YYYY') : 'Not found'
  }

  formatLicenceDate = (dateToFormat: string): string => {
    return dateToFormat ? moment(dateToFormat, 'DD/MM/YYYY').format('DD MMM YYYY') : 'Not found'
  }
}
