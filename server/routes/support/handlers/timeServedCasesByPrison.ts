import { Request, Response } from 'express'
import { format } from 'date-fns'

import CaCaseloadService from '../../../services/lists/caCaseloadService'
import UserService from '../../../services/userService'
import ProbationService from '../../../services/probationService'
import { convertToTitleCase } from '../../../utils/utils'
import { TimeServedCase } from '../../../@types/licenceApiClientTypes'
import { DeliusManager } from '../../../@types/deliusClientTypes'

export default class TimeServedCasesByPrisonRoutes {
  constructor(
    private readonly caCaseloadService: CaCaseloadService,
    private readonly probationService: ProbationService,
    private readonly userService: UserService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { prisonCode } = req.params || {}

    const prisonCaseloadFromNomis = await this.userService.getPrisonUserCaseloads(user)
    const prisons = prisonCaseloadFromNomis.map(c => ({
      value: c.caseLoadId,
      text: c.description,
      selected: c.caseLoadId === prisonCode,
    }))

    if (!prisonCode) {
      return res.redirect(`/support/time-served-cases/by-prison/${user.activeCaseload}`)
    }

    const caseload = await this.getCases(user, prisonCode)

    return res.render('pages/support/timeServedCasesByPrison', { caseload, user, prisons, prisonCode })
  }

  GET_CSV = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { prisonCode } = req.params || {}

    const caseload = await this.getCases(user, prisonCode)

    const header = [
      'Name',
      'Prison Number',
      'CRN',
      'Legal Status',
      'Release Date',
      'Probation Practitioner',
      'Probation Practitioner Email',
      'Is Time Served Case',
      'Is Time Served Case By All Prison Rule',
      'Is Time Served Case By Crds Rule',
      'Is Time Served Case By Non Crds Rule',
      'Is Time Served Case By Ignoring ARD Rule',
      'Conditional Release Date',
      'Conditional Release Date Override',
      'Confirmed Release Date',
      'Sentence Start Date',
    ]

    const csv = caseload.identifiedCases
      .concat(caseload.otherCases)
      .map(aCase => [
        aCase.name,
        aCase.prisonNumber,
        aCase.crn,
        aCase.legalStatus,
        aCase.releaseDate,
        aCase.probationPractitioner,
        aCase.probationPractitionerEmail,
        aCase.isTimeServedCase,
        aCase.isTimeServedCaseByAllPrisonRule,
        aCase.isTimeServedCaseByCrdsRule,
        aCase.isTimeServedCaseByNonCrdsRule,
        aCase.isTimeServedCaseByIgnoreArdRule,
        aCase.conditionalReleaseDate,
        aCase.conditionalReleaseDateOverride,
        aCase.confirmedReleaseDate,
        aCase.sentenceStartDate,
      ])
      .map(row => row.join(','))
      .join('\n')

    res.type('text/csv')
    res.setHeader(
      `Content-disposition`,
      `attachment; filename=time-served-case-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`,
    )
    res.send(`${header.join(',')}\n${csv}`)
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { prisonCode } = req.body
    return res.redirect(`/support/time-served-cases/by-prison/${prisonCode || user.activeCaseload}`)
  }

  private async getCases(user: Express.LocalsUser, prisonCode: string) {
    const cases = await this.caCaseloadService.getTimeServedCases(user, prisonCode)

    const deliusRecords = await this.probationService.getResponsibleCommunityManagers(
      cases.identifiedCases.concat(cases.otherCases).map(o => o.prisonerNumber),
    )

    return {
      identifiedCases: cases.identifiedCases.map(this.buildCase(deliusRecords)),
      otherCases: cases.otherCases.map(this.buildCase(deliusRecords)),
    }
  }

  buildCase = (deliusRecords: DeliusManager[]) => (aCase: TimeServedCase) => {
    const deliusRecord = deliusRecords.find(d => d.case.nomisId === aCase.prisonerNumber)
    return {
      name: aCase.name,
      prisonNumber: aCase.prisonerNumber,
      crn: deliusRecord?.case?.crn,
      legalStatus: aCase.nomisLegalStatus,
      releaseDate: aCase.releaseDate,
      probationPractitioner: convertToTitleCase(aCase?.probationPractitioner?.name),
      probationPractitionerEmail: deliusRecord?.email,
      isTimeServedCase: aCase.isTimeServedCase,
      isTimeServedCaseByAllPrisonRule: aCase.isTimeServedCaseByAllPrisonRule,
      isTimeServedCaseByCrdsRule: aCase.isTimeServedCaseByCrdsRule,
      isTimeServedCaseByNonCrdsRule: aCase.isTimeServedCaseByNonCrdsRule,
      isTimeServedCaseByIgnoreArdRule: aCase.isTimeServedCaseByIgnoreArdRule,
      conditionalReleaseDate: aCase.conditionalReleaseDate,
      conditionalReleaseDateOverride: aCase.conditionalReleaseDateOverride,
      confirmedReleaseDate: aCase.confirmedReleaseDate,
      sentenceStartDate: aCase.sentenceStartDate,
    }
  }
}
