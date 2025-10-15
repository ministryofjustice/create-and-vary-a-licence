import { Request, Response } from 'express'
import { format } from 'date-fns'

import CaCaseloadService from '../../../services/lists/caCaseloadService'
import UserService from '../../../services/userService'
import ProbationService from '../../../services/probationService'
import { convertToTitleCase } from '../../../utils/utils'

export default class PrrdCasesByPrisonRoutes {
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
      return res.redirect(`/support/prrd-cases/by-prison/${user.activeCaseload}`)
    }

    const caseload = await this.getCases(user, prisonCode)

    return res.render('pages/support/prrdCasesByPrison', { caseload, user, prisons, prisonCode })
  }

  GET_CSV = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { prisonCode } = req.params || {}

    const caseload = await this.getCases(user, prisonCode)

    const header = [
      'Name',
      'Prison Number',
      'CRN',
      'Licence Status',
      'Release Date',
      'Probation Practitioner',
      'Probation Practitioner Email',
    ]

    const csv = caseload
      .map(aCase => [
        aCase.name,
        aCase.prisonNumber,
        aCase.crn,
        aCase.licenceStatus,
        aCase.releaseDate,
        aCase.probationPractitioner,
        aCase.probationPractitionerEmail,
      ])
      .map(row => row.join(','))
      .join('\n')

    res.type('text/csv')
    res.setHeader(`Content-disposition`, `attachment; filename=prrd-case-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`)
    res.send(`${header.join(',')}\n${csv}`)
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { prisonCode } = req.body
    return res.redirect(`/support/prrd-cases/by-prison/${prisonCode || user.activeCaseload}`)
  }

  private async getCases(user: Express.LocalsUser, prisonCode: string) {
    const cases = await this.caCaseloadService.getPrisonOmuCaseload(user, [prisonCode])

    const deliusRecords = await this.probationService.getResponsibleCommunityManagers(cases.map(o => o.prisonerNumber))

    const caseload = cases
      .filter(aCase => aCase.kind === 'PRRD')
      .map(aCase => {
        const deliusRecord = deliusRecords.find(d => d.case.nomisId === aCase.prisonerNumber)
        return {
          name: aCase.name,
          prisonNumber: aCase.prisonerNumber,
          crn: deliusRecord?.case.crn,
          licenceStatus: aCase.licenceStatus,
          releaseDate: aCase.releaseDate,
          probationPractitioner: convertToTitleCase(aCase.probationPractitioner.name),
          probationPractitionerEmail: deliusRecord.email,
        }
      })
    return caseload
  }
}
