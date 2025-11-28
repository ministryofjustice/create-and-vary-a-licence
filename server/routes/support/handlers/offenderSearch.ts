import { Request, Response } from 'express'
import _ from 'lodash'
import { Prisoner, PrisonerSearchCriteria } from '../../../@types/prisonerSearchApiClientTypes'
import PrisonerService from '../../../services/prisonerService'
import ProbationService from '../../../services/probationService'
import { convertToTitleCase } from '../../../utils/utils'
import { DeliusRecord } from '../../../@types/deliusClientTypes'

export default class OffenderSearchRoutes {
  constructor(
    private readonly prisonerService: PrisonerService,
    private readonly probationService: ProbationService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const {
      firstName: firstNameInput,
      lastName: lastNameInput,
      nomisId: nomisIdInput,
      crn: crnInput,
    } = req.query as Record<string, string>
    const { user } = res.locals

    const firstName = firstNameInput?.trim()
    const lastName = lastNameInput?.trim()
    const nomisId = nomisIdInput?.trim()
    const crn = crnInput?.trim()

    const searchValues = { firstName, lastName, nomisId, crn }

    if (Object.values(searchValues).every(x => !x || x === '')) {
      return res.render('pages/support/offenderSearch')
    }

    let deliusRecords: DeliusRecord[]
    let nomisRecords
    if (!_.isEmpty(crn)) {
      deliusRecords = [await this.probationService.getProbationer(crn)]
      nomisRecords = await this.prisonerService
        .searchPrisoners(
          {
            prisonerIdentifier: deliusRecords[0]?.nomisId,
          } as PrisonerSearchCriteria,
          user,
        )
        .catch((): Prisoner[] => [])
    } else {
      nomisRecords = await this.prisonerService
        .searchPrisoners(
          {
            firstName,
            lastName,
            prisonerIdentifier: nomisId || null,
          } as PrisonerSearchCriteria,
          user,
        )
        .catch((): Prisoner[] => [])
      deliusRecords = await this.probationService.getProbationers(nomisRecords.map(o => o.prisonerNumber))
    }

    const searchResults = nomisRecords
      .map(o => {
        return {
          name: convertToTitleCase(`${o.firstName} ${o.lastName}`),
          prison: o.prisonName,
          nomisId: o.prisonerNumber,
          crn: deliusRecords.find(d => d.nomisId === o.prisonerNumber)?.crn,
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
