import { Request, Response } from 'express'
import { format, getUnixTime } from 'date-fns'
import _ from 'lodash'
import statusConfig from '../../../licences/licenceStatus'
import CaseloadService from '../../../services/caseloadService'
import { convertToTitleCase } from '../../../utils/utils'
import LicenceStatus from '../../../enumeration/licenceStatus'
import PrisonerService from '../../../services/prisonerService'
import { Prisoner } from '../../../@types/prisonerSearchApiClientTypes'
import logger from '../../../../logger'

export default class ViewAndPrintCaseRoutes {
  constructor(private readonly caseloadService: CaseloadService, private readonly prisonerService: PrisonerService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const search = req.query.search as string
    const view = req.query.view || 'prison'
    const probationView = view === 'probation'
    const { user } = res.locals
    const { caseloadsSelected = [] } = req.session
    const hasMultipleCaseloadsInNomis = user.prisonCaseload.length > 1
    const allPrisons = await this.prisonerService.getPrisons()
    const activeCaseload = allPrisons.filter(p => p.agencyId === user.activeCaseload)
    const prisonCaseloadToDisplay = caseloadsSelected.length ? caseloadsSelected : [activeCaseload[0].agencyId]

    const cases = await this.caseloadService.getOmuCaseload(user, prisonCaseloadToDisplay, view as string)
    const caseloadViewModel = cases
      .map(c => {
        return {
          licenceId: _.head(c.licences).id,
          name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
          prisonerNumber: c.nomisRecord.prisonerNumber,
          probationPractitioner: c.probationPractitioner,
          releaseDate: this.selectReleaseDate(c.nomisRecord),
          releaseDateLabel: c.nomisRecord.confirmedReleaseDate ? 'Confirmed release date' : 'CRD',
          licenceStatus: _.head(c.licences).status,
          isClickable:
            _.head(c.licences).status !== LicenceStatus.NOT_STARTED &&
            _.head(c.licences).status !== LicenceStatus.NOT_IN_PILOT &&
            _.head(c.licences).status !== LicenceStatus.OOS_RECALL &&
            _.head(c.licences).status !== LicenceStatus.OOS_BOTUS &&
            _.head(c.licences).status !== LicenceStatus.IN_PROGRESS &&
            _.head(c.licences).status !== LicenceStatus.VARIATION_IN_PROGRESS &&
            _.head(c.licences).status !== LicenceStatus.VARIATION_APPROVED &&
            _.head(c.licences).status !== LicenceStatus.VARIATION_SUBMITTED,
        }
      })
      .filter(c => {
        const searchString = search?.toLowerCase().trim()
        if (!searchString) return true
        return (
          c.name.toLowerCase().includes(searchString) ||
          c.prisonerNumber?.toLowerCase().includes(searchString) ||
          c.probationPractitioner?.name.toLowerCase().includes(searchString)
        )
      })
      .sort((a, b) => {
        const crd1 = getUnixTime(new Date(a.releaseDate))
        const crd2 = getUnixTime(new Date(b.releaseDate))
        return crd1 - crd2
      })

    const prisonsToDisplay = allPrisons.filter(p => prisonCaseloadToDisplay.includes(p.agencyId))

    res.render('pages/view/cases', {
      cases: caseloadViewModel,
      statusConfig,
      search,
      prisonsToDisplay,
      hasMultipleCaseloadsInNomis,
      probationView,
    })
  }

  selectReleaseDate(nomisRecord: Prisoner) {
    let dateString = nomisRecord.conditionalReleaseDate

    if (nomisRecord.confirmedReleaseDate) {
      dateString = nomisRecord.confirmedReleaseDate
    }

    if (nomisRecord.conditionalReleaseOverrideDate) {
      dateString = nomisRecord.conditionalReleaseOverrideDate
    }

    try {
      dateString = format(new Date(dateString), 'dd MMM yyyy')
    } catch (e) {
      logger.error(
        `Date error: ${e.message} for prisonerNumber: ${nomisRecord.prisonerNumber} using date: ${dateString}`
      )
    }

    return dateString
  }
}
