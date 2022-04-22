import { RequestHandler } from 'express'
import _ from 'lodash'
import { PrisonerSearchCriteria } from '../../../@types/prisonerSearchApiClientTypes'
import PrisonerService from '../../../services/prisonerService'
import CommunityService from '../../../services/communityService'
import { OffenderDetail } from '../../../@types/probationSearchApiClientTypes'
import { convertToTitleCase } from '../../../utils/utils'

export default class OffenderSearchRoutes {
  constructor(private readonly prisonerService: PrisonerService, private readonly communityService: CommunityService) {}

  public GET: RequestHandler = async (req, res): Promise<void> => {
    const { firstName, lastName, nomisId, crn } = req.query as Record<string, string>
    const { user } = res.locals
    const searchValues = { firstName, lastName, nomisId, crn }

    if (_.isEmpty(req.query)) {
      return res.render('pages/support/offenderSearch')
    }

    let deliusRecords: OffenderDetail[]
    let nomisRecords
    if (!_.isEmpty(crn)) {
      deliusRecords = await this.communityService.getOffendersByCrn([crn])
      nomisRecords = await this.prisonerService
        .searchPrisoners(
          {
            prisonerIdentifier: deliusRecords[0]?.otherIds?.nomsNumber,
          } as PrisonerSearchCriteria,
          user
        )
        .catch(() => [])
    } else {
      nomisRecords = await this.prisonerService
        .searchPrisoners(
          {
            firstName,
            lastName,
            prisonerIdentifier: nomisId || null,
          } as PrisonerSearchCriteria,
          user
        )
        .catch(() => [])
      deliusRecords = await this.communityService.getOffendersByNomsNumbers(nomisRecords.map(o => o.prisonerNumber))
    }

    const searchResults = nomisRecords
      .map(o => {
        return {
          name: convertToTitleCase(`${o.firstName} ${o.lastName}`),
          prison: o.prisonName,
          nomisId: o.prisonerNumber,
          crn: deliusRecords.find(d => d.otherIds.nomsNumber === o.prisonerNumber)?.otherIds.crn,
        }
      })
      .sort((a, b) => {
        if (a.name < b.name) {
          return -1
        }
        if (a.name > b.name) {
          return 1
        }
        return 0
      })

    return res.render('pages/support/offenderSearch', { searchResults, searchValues })
  }
}
