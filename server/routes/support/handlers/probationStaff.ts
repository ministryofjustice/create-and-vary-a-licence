import { Request, Response } from 'express'
import { parse, subDays } from 'date-fns'
import CaseloadService from '../../../services/caseloadService'
import createCaseloadViewModel from '../../views/CaseloadViewModel'
import statusConfig from '../../../licences/licenceStatus'
import CommunityService from '../../../services/communityService'
import UkBankHolidayFeedService from '../../../services/ukBankHolidayFeedService'

export default class ProbationTeamRoutes {
  constructor(
    private readonly caseloadService: CaseloadService,
    private readonly communityService: CommunityService,
    private readonly bankHolidayService: UkBankHolidayFeedService
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const view = req.query.view as string
    const { staffCode } = req.params

    if (!view) {
      return res.redirect(`/support/probation-practitioner/${staffCode}/caseload?view=prison`)
    }

    const { user } = res.locals

    const staff = await this.communityService.getStaffDetailByStaffCode(staffCode)

    const caseload =
      view === 'prison'
        ? await this.caseloadService.getStaffCreateCaseload({ ...user, deliusStaffIdentifier: staff.staffIdentifier })
        : await this.caseloadService.getStaffVaryCaseload({ ...user, deliusStaffIdentifier: staff.staffIdentifier })

    const hardStopCutoffDate = parse(
      (await this.caseloadService.getCutOffDateForLicenceTimeOut(user)).cutoffDate,
      'dd/MM/yyyy',
      new Date()
    )
    const bankHolidays = await this.bankHolidayService.getEnglishAndWelshHolidays()
    const hardStopWarningDate = bankHolidays.getTwoWorkingDaysAfterDate(hardStopCutoffDate)

    const hardStopDates = { hardStopCutoffDate, hardStopWarningDate }

    return res.render('pages/support/probationStaff', {
      caseload: createCaseloadViewModel(caseload, undefined, hardStopDates),
      statusConfig,
      view,
      staffName: `${staff.staff.forenames} ${staff.staff.surname} (${staff.staffCode})`,
    })
  }
}
