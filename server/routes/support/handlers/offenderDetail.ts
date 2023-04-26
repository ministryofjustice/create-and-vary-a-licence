import { Request, Response } from 'express'
import _ from 'lodash'
import moment from 'moment'
import PrisonerService from '../../../services/prisonerService'
import CommunityService from '../../../services/communityService'
import { convertToTitleCase } from '../../../utils/utils'
import LicenceService from '../../../services/licenceService'

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
    const licenceSummary = await this.licenceServer.getLatestLicenceByNomisIdsAndStatus([nomsId], [], user)

    let licenceFromSummary
    let licencecrn = 'Not found'
    let crd = 'Not found'
    let actualReleaseDate = 'Not found'
    let sentenceStartDate = 'Not found'
    let sed = 'Not found'
    let led = 'Not found'
    let tussd = 'Not found'
    let licenceTused = 'Not found'

    if (licenceSummary != null) {
      licenceFromSummary = await this.licenceServer.getLicence(licenceSummary.licenceId.toString(), user)
    }
    if (licenceFromSummary != null) {
      licencecrn = licenceFromSummary.crn ? licenceFromSummary.crn : 'Not found'
      crd = licenceFromSummary.conditionalReleaseDate
        ? moment(licenceFromSummary.conditionalReleaseDate, 'DD/MM/YYYY').format('DD MMM YYYY')
        : 'Not found'
      actualReleaseDate = licenceFromSummary.actualReleaseDate ? licenceFromSummary.actualReleaseDate : 'Not found'
      sentenceStartDate = licenceFromSummary.sentenceStartDate
        ? moment(licenceFromSummary.sentenceStartDate, 'DD/MM/YYYY').format('DD MMM YYYY')
        : 'Not found'
      sed = licenceFromSummary.sentenceEndDate
        ? moment(licenceFromSummary.sentenceEndDate, 'DD/MM/YYYY').format('DD MMM YYYY')
        : 'Not found'
      led = licenceFromSummary.licenceExpiryDate
        ? moment(licenceFromSummary.licenceExpiryDate, 'DD/MM/YYYY').format('DD MMM YYYY')
        : 'Not found'
      tussd = licenceFromSummary.topupSupervisionStartDate
        ? moment(licenceFromSummary.topupSupervisionStartDate, 'DD/MM/YYYY').format('DD MMM YYYY')
        : 'Not found'
      licenceTused = licenceFromSummary.topupSupervisionExpiryDate
        ? moment(licenceFromSummary.topupSupervisionExpiryDate, 'DD/MM/YYYY').format('DD MMM YYYY')
        : 'Not found'
    }
    const conditionalReleaseDate = prisonerDetail.conditionalReleaseDate
      ? moment(prisonerDetail.conditionalReleaseDate).format('DD MMM YYYY')
      : 'Not found'
    const confirmedReleaseDate = prisonerDetail.confirmedReleaseDate
      ? moment(prisonerDetail.confirmedReleaseDate).format('DD MMM YYYY')
      : 'Not found'
    const postRecallReleaseDate = prisonerDetail.postRecallReleaseDate
      ? moment(prisonerDetail.postRecallReleaseDate).format('DD MMM YYYY')
      : 'Not found'
    const tused = prisonerDetail.topupSupervisionExpiryDate
      ? moment(prisonerDetail.topupSupervisionExpiryDate).format('DD MMM YYYY')
      : 'Not found'
    const hdced = prisonerDetail.homeDetentionCurfewEligibilityDate
      ? moment(prisonerDetail.homeDetentionCurfewEligibilityDate).format('DD MMM YYYY')
      : 'Not found'
    const sentenceExpiryDate = prisonerDetail.sentenceExpiryDate
      ? moment(prisonerDetail.sentenceExpiryDate).format('DD MMM YYYY')
      : 'Not found'
    const licenceExpiryDate = prisonerDetail.licenceExpiryDate
      ? moment(prisonerDetail.licenceExpiryDate).format('DD MMM YYYY')
      : 'Not found'
    const paroleEligibilityDate = prisonerDetail.paroleEligibilityDate
      ? moment(prisonerDetail.paroleEligibilityDate).format('DD MMM YYYY')
      : 'Not found'

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
      license: {
        licencecrn,
        crd,
        actualReleaseDate,
        sentenceStartDate,
        sed,
        led,
        tussd,
        licenceTused,
      },
    })
  }
}
