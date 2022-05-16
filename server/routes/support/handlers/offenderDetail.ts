import { Request, Response } from 'express'
import _ from 'lodash'
import moment from 'moment'
import PrisonerService from '../../../services/prisonerService'
import CommunityService from '../../../services/communityService'
import { convertToTitleCase } from '../../../utils/utils'

export default class OffenderDetailRoutes {
  constructor(private readonly prisonerService: PrisonerService, private readonly communityService: CommunityService) {}

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

    res.render('pages/support/offenderDetail', {
      prisonerDetail: {
        ...prisonerDetail,
        name: convertToTitleCase(`${prisonerDetail.firstName} ${prisonerDetail.lastName}`),
        crn: deliusRecord?.otherIds.crn,
        conditionalReleaseDate: moment(prisonerDetail.conditionalReleaseDate).format('DD MMM YYYY'),
        confirmedReleaseDate: moment(prisonerDetail.confirmedReleaseDate).format('DD MMM YYYY'),
        postRecallReleaseDate: moment(prisonerDetail.postRecallReleaseDate).format('DD MMM YYYY'),
        tused: moment(prisonerDetail.topupSupervisionExpiryDate).format('DD MMM YYYY'),
        hdced: moment(prisonerDetail.homeDetentionCurfewEligibilityDate).format('DD MMM YYYY'),
        sentenceExpiryDate: moment(prisonerDetail.sentenceExpiryDate).format('DD MMM YYYY'),
        licenceExpiryDate: moment(prisonerDetail.licenceExpiryDate).format('DD MMM YYYY'),
        paroleEligibilityDate: moment(prisonerDetail.paroleEligibilityDate).format('DD MMM YYYY'),
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
    })
  }
}
