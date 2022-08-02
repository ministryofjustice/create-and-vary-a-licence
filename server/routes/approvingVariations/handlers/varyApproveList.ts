import { Request, Response } from 'express'
import moment from 'moment'
import _ from 'lodash'
import { format, parse } from 'date-fns'
import CaseloadService from '../../../services/caseloadService'
import { convertToTitleCase } from '../../../utils/utils'

export default class VaryApproveListRoutes {
  constructor(private readonly caseloadService: CaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const search = req.query.search as string
    const regionCases = req.query?.view === 'region'
    const { user } = res.locals

    const cases = regionCases
      ? await this.caseloadService.getVaryApproverCaseloadByRegion(user)
      : await this.caseloadService.getVaryApproverCaseload(user)

    const caseloadViewModel = cases
      .map(c => {
        const licence = _.head(c.licences)

        const releaseDate = c.nomisRecord.releaseDate
          ? format(parse(c.nomisRecord.releaseDate, 'yyyy-MM-dd', new Date()), 'dd MMM yyyy')
          : null

        const variationRequestDate = licence.dateCreated
          ? format(parse(licence.dateCreated, 'dd/MM/yyyy HH:mm', new Date()), 'dd MMMM yyyy')
          : null

        return {
          licenceId: licence.id,
          name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
          crnNumber: c.deliusRecord.otherIds.crn,
          licenceType: licence.type,
          variationRequestDate,
          releaseDate,
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
    res.render('pages/vary-approve/cases', { caseload: caseloadViewModel, search, regionCases })
  }
}
