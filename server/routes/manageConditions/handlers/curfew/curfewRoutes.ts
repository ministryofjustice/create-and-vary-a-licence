import { Request, Response } from 'express'
import LicenceService from '../../../../services/licenceService'
import ConditionService from '../../../../services/conditionService'
import { AddAdditionalConditionRequest, AdditionalCondition, Licence } from '../../../../@types/licenceApiClientTypes'
import { SimpleTime } from '../../types'
import { User } from '../../../../@types/CvlUserDetails'

type CurfewType = 'One curfew' | 'Two curfews' | 'Three curfews'
export default class CurfewRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly conditionService: ConditionService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { conditionCode } = req.params
    const { licence } = res.locals

    const additionalCondition = licence.additionalLicenceConditions.find(
      (condition: AdditionalCondition) => condition.code === conditionCode,
    )
    const conditionInstances = (licence.additionalLicenceConditions as AdditionalCondition[])
      .filter(condition => condition.code === conditionCode)
      .sort((a, b) => a.id - b.id)
    const config = await this.conditionService.getAdditionalConditionByCode(conditionCode, licence.version)

    if (!additionalCondition) {
      return res.redirect(
        `/licence/create/id/${licence.id}/additional-licence-conditions${
          req.query?.fromReview ? '?fromReview=true' : ''
        }`,
      )
    }

    const curfewTimes = Object.fromEntries(
      conditionInstances.flatMap((instance, index) =>
        instance.data.map(conditionData => {
          const key = index === 0 ? conditionData.field : `${conditionData.field}${index + 1}`
          return [key, conditionData.value]
        }),
      ),
    )

    return res.render('pages/manageConditions/curfew/input', {
      additionalConditionCode: additionalCondition.code,
      reviewPeriod: additionalCondition.data.find(
        (data: { field: string; value: string }) => data.field === 'reviewPeriod',
      )?.value,
      alternativeReviewPeriod: additionalCondition.data.find(
        (data: { field: string; value: string }) => data.field === 'alternativeReviewPeriod',
      )?.value,
      numberOfCurfews: additionalCondition.data.find(
        (data: { field: string; value: string }) => data.field === 'numberOfCurfews',
      )?.value as CurfewType,
      curfewTimes: this.formatCurfewTimes(curfewTimes),
      config,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { conditionCode } = req.params
    const { user, licence } = res.locals
    const inputs = req.body

    const numberOfCurfews = inputs.numberOfCurfews as CurfewType

    const {
      oneCurfewStart,
      oneCurfewEnd,
      twoCurfewStart,
      twoCurfewEnd,
      twoCurfewStart2,
      twoCurfewEnd2,
      threeCurfewStart,
      threeCurfewEnd,
      threeCurfewStart2,
      threeCurfewEnd2,
      threeCurfewStart3,
      threeCurfewEnd3,
      reviewPeriod,
      alternativeReviewPeriod,
    } = inputs

    await this.licenceService.deleteAdditionalConditionsByCode([conditionCode], licence.id, user)

    if (numberOfCurfews === 'One curfew') {
      await this.addCurfewCondition(
        licence,
        user,
        conditionCode,
        oneCurfewStart,
        oneCurfewEnd,
        numberOfCurfews,
        reviewPeriod,
        alternativeReviewPeriod,
      )
    }

    if (numberOfCurfews === 'Two curfews') {
      await this.addCurfewCondition(
        licence,
        user,
        conditionCode,
        twoCurfewStart,
        twoCurfewEnd,
        numberOfCurfews,
        reviewPeriod,
        alternativeReviewPeriod,
      )
      await this.addCurfewCondition(
        licence,
        user,
        conditionCode,
        twoCurfewStart2,
        twoCurfewEnd2,
        numberOfCurfews,
        reviewPeriod,
        alternativeReviewPeriod,
      )
    }

    if (numberOfCurfews === 'Three curfews') {
      await this.addCurfewCondition(
        licence,
        user,
        conditionCode,
        threeCurfewStart,
        threeCurfewEnd,
        numberOfCurfews,
        reviewPeriod,
        alternativeReviewPeriod,
      )
      await this.addCurfewCondition(
        licence,
        user,
        conditionCode,
        threeCurfewStart2,
        threeCurfewEnd2,
        numberOfCurfews,
        reviewPeriod,
        alternativeReviewPeriod,
      )
      await this.addCurfewCondition(
        licence,
        user,
        conditionCode,
        threeCurfewStart3,
        threeCurfewEnd3,
        numberOfCurfews,
        reviewPeriod,
        alternativeReviewPeriod,
      )
    }

    const redirectUrl = `/licence/create/id/${licence.id}/additional-licence-conditions/callback${
      req.query?.fromReview ? '?fromReview=true' : ''
    }`

    return res.redirect(redirectUrl)
  }

  addCurfewCondition = async (
    licence: Licence,
    user: User,
    conditionCode: string,
    startDate: SimpleTime,
    endDate: SimpleTime,
    numberOfCurfews: string,
    reviewPeriod: string,
    alternativeReviewPeriod: string,
  ): Promise<void> => {
    const condition = await this.conditionService.getAdditionalConditionByCode(conditionCode, licence.version)
    const type = await this.conditionService.getAdditionalConditionType(conditionCode, licence.version)

    const sequence = this.conditionService.currentOrNextSequenceForCondition(
      licence.additionalLicenceConditions,
      conditionCode,
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
      user,
    )

    const conditionData = {
      numberOfCurfews,
      curfewStart: startDate,
      curfewEnd: endDate,
      reviewPeriod,
      alternativeReviewPeriod: reviewPeriod === 'Other' ? alternativeReviewPeriod : null,
    }

    await this.licenceService.updateAdditionalConditionData(
      licence.id.toString(),
      licenceCondition,
      conditionData,
      user,
    )
  }

  formatCurfewTimes(curfewTimes: Record<string, string>): Record<string, SimpleTime> {
    switch (curfewTimes.numberOfCurfews as CurfewType) {
      case 'One curfew':
        return {
          oneCurfewStart: SimpleTime.fromString(curfewTimes.curfewStart),
          oneCurfewEnd: SimpleTime.fromString(curfewTimes.curfewEnd),
        }

      case 'Two curfews':
        return {
          twoCurfewStart: SimpleTime.fromString(curfewTimes.curfewStart),
          twoCurfewEnd: SimpleTime.fromString(curfewTimes.curfewEnd),
          twoCurfewStart2: SimpleTime.fromString(curfewTimes.curfewStart2),
          twoCurfewEnd2: SimpleTime.fromString(curfewTimes.curfewEnd2),
        }

      case 'Three curfews':
        return {
          threeCurfewStart: SimpleTime.fromString(curfewTimes.curfewStart),
          threeCurfewEnd: SimpleTime.fromString(curfewTimes.curfewEnd),
          threeCurfewStart2: SimpleTime.fromString(curfewTimes.curfewStart2),
          threeCurfewEnd2: SimpleTime.fromString(curfewTimes.curfewEnd2),
          threeCurfewStart3: SimpleTime.fromString(curfewTimes.curfewStart3),
          threeCurfewEnd3: SimpleTime.fromString(curfewTimes.curfewEnd3),
        }

      default:
        return null
    }
  }
}
