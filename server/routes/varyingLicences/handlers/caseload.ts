import { Request, Response } from 'express'
import moment from 'moment'
import _ from 'lodash'
import CaseloadService from '../../../services/caseloadService'
import statusConfig from '../../../licences/licenceStatus'
import LicenceType from '../../../enumeration/licenceType'
import { convertToTitleCase, isWithinPssPeriod } from '../../../utils/utils'
import LicenceStatus from '../../../enumeration/licenceStatus'
import logger from '../../../../logger'

export default class CaseloadRoutes {
  constructor(private readonly caseloadService: CaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const teamView = req.query.view === 'team'
    const search = req.query.search as string
    const { user } = res.locals

    const cases = teamView
      ? await this.caseloadService.getTeamVaryCaseload(user)
      : await this.caseloadService.getStaffVaryCaseload(user)

    const caseloadViewModel = cases
      .map(c => {
        const licence =
          c.licences.length > 1 ? c.licences.find(l => l.status !== LicenceStatus.ACTIVE) : _.head(c.licences)

        let pssLicenceStatus: LicenceStatus = null

        if (
          licence.type === LicenceType.AP_PSS &&
          (!c.nomisRecord.topupSupervisionStartDate || !c.nomisRecord.topupSupervisionExpiryDate)
        ) {
          logger.error(`AP_PSS licence with CRN: ${c.deliusRecord.otherIds.crn} missing tussd or tused`)
        }

        const inPssPeriod = isWithinPssPeriod(
          c.nomisRecord.topupSupervisionStartDate,
          c.nomisRecord.topupSupervisionExpiryDate
        )

        if (licence.type === LicenceType.AP_PSS && inPssPeriod) {
          pssLicenceStatus = LicenceStatus.ON_PSS
        }

        return {
          licenceId: licence.id,
          name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
          crnNumber: c.deliusRecord.otherIds.crn,
          licenceType: licence.type,
          releaseDate: moment(c.nomisRecord.releaseDate, 'YYYY-MM-DD').format('DD MMM YYYY'),
          licenceStatus: pssLicenceStatus || licence.status,
          probationPractitioner: c.probationPractitioner,
        }
      })
      .filter(c => {
        const searchString = search?.toLowerCase().trim()
        if (!searchString) return true
        return (
          c.crnNumber?.toLowerCase().includes(searchString) ||
          c.name.toLowerCase().includes(searchString) ||
          c.probationPractitioner?.name.toLowerCase().includes(searchString)
        )
      })
      .sort((a, b) => {
        const crd1 = moment(a.releaseDate, 'DD MMM YYYY').unix()
        const crd2 = moment(b.releaseDate, 'DD MMM YYYY').unix()
        return crd1 - crd2
      })
    res.render('pages/vary/caseload', { caseload: caseloadViewModel, statusConfig, search, teamView })
  }
}
