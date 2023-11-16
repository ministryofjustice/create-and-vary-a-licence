import { Request, Response } from 'express'
import LicenceService from '../../../../services/licenceService'
import ConditionService from '../../../../services/conditionService'
import { AddAdditionalConditionRequest, Licence } from '../../../../@types/licenceApiClientTypes'
import { SimpleTime } from '../../types'
import { User } from '../../../../@types/CvlUserDetails'

export default class CurfewRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly conditionService: ConditionService
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { conditionCode } = req.params
    const { licence } = res.locals

    const additionalCondition = licence.additionalLicenceConditions.find(condition => condition.code === conditionCode)
    const conditionInstances = licence.additionalLicenceConditions
      .filter(condition => condition.code === conditionCode)
      .sort((a, b) => a.id - b.id)
    const config = await this.conditionService.getAdditionalConditionByCode(conditionCode, licence.version)

    if (!additionalCondition) {
      return res.redirect(
        `/licence/create/id/${licence.id}/additional-licence-conditions${
          req.query?.fromReview ? '?fromReview=true' : ''
        }`
      )
    }

    const formResponses = Object.fromEntries(
      conditionInstances.flatMap((instance, index) =>
        instance.data.map(conditionData => {
          const key = index === 0 ? conditionData.field : `${conditionData.field}${index + 1}`
          return [key, conditionData.value]
        })
      )
    )

    return res.render('pages/manageConditions/curfew/input', { additionalCondition, config, formResponses })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { conditionCode } = req.params
    const { user, licence } = res.locals
    const inputs = req.body

    await this.licenceService.deleteAdditionalConditionsByCode(conditionCode, licence, user)

    await this.addCurfewCondition(licence, user, conditionCode, inputs.curfewStart, inputs.curfewEnd, inputs)
    if (inputs.numberOfCurfews === 'Two curfews' || inputs.numberOfCurfews === 'Three curfews') {
      await this.addCurfewCondition(licence, user, conditionCode, inputs.curfewStart2, inputs.curfewEnd2, inputs)
    }
    if (inputs.numberOfCurfews === 'Three curfews') {
      await this.addCurfewCondition(licence, user, conditionCode, inputs.curfewStart3, inputs.curfewEnd3, inputs)
    }

    return res.redirect(
      `/licence/create/id/${licence.id}/additional-licence-conditions/callback${
        req.query?.fromReview ? '?fromReview=true' : ''
      }`
    )
  }

  addCurfewCondition = async (
    licence: Licence,
    user: User,
    conditionCode: string,
    startDate: SimpleTime,
    endDate: SimpleTime,
    inputs: Record<string, string | SimpleTime>
  ): Promise<void> => {
    const condition = await this.conditionService.getAdditionalConditionByCode(conditionCode, licence.version)
    const type = await this.conditionService.getAdditionalConditionType(conditionCode, licence.version)

    const sequence = this.conditionService.currentOrNextSequenceForCondition(
      licence.additionalLicenceConditions,
      conditionCode
    )

    const request = {
      conditionCode,
      conditionCategory: condition.categoryShort || condition.category,
      conditionText: condition.text,
      conditionType: type,
      expandedText: condition.tpl,
      sequence,
    } as AddAdditionalConditionRequest

    const licenceCondition = await this.licenceService.addAdditionalCondition(
      licence.id.toString(),
      type,
      request,
      user
    )

    const conditionData = {
      numberOfCurfews: inputs.numberOfCurfews,
      curfewStart: startDate,
      curfewEnd: endDate,
      reviewPeriod: inputs.reviewPeriod,
      alternativeReviewPeriod: inputs.alternativeReviewPeriod,
    }

    await this.licenceService.updateAdditionalConditionData(
      licence.id.toString(),
      licenceCondition,
      conditionData,
      user
    )
  }
}
