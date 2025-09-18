import { Request, Response } from 'express'
import LicenceService from '../../../../services/licenceService'
import ConditionService from '../../../../services/conditionService'
import { AddAdditionalConditionRequest, AdditionalCondition, Licence } from '../../../../@types/licenceApiClientTypes'
import { SimpleTime } from '../../types'
import { User } from '../../../../@types/CvlUserDetails'

type CurfewType = 'One curfew' | 'Two curfews' | 'Three curfews'
const curfewCountMap: Record<CurfewType, number> = {
  'One curfew': 1,
  'Two curfews': 2,
  'Three curfews': 3,
}
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

    const getFieldValue = (fieldName: string): string | undefined =>
      additionalCondition.data.find((data: { field: string; value: string }) => data.field === fieldName)?.value

    const numberOfCurfewsLabel = getFieldValue('numberOfCurfews') as CurfewType

    const numberOfCurfews = curfewCountMap[numberOfCurfewsLabel] || 0

    const curfews: Record<number, { start: SimpleTime; end: SimpleTime }[]> = {
      [numberOfCurfews]: conditionInstances.map(instance => {
        const startStr = instance?.data.find(d => d.field === 'curfewStart')?.value
        const endStr = instance?.data.find(d => d.field === 'curfewEnd')?.value

        return {
          start: SimpleTime.fromString(startStr),
          end: SimpleTime.fromString(endStr),
        }
      }),
    }

    return res.render('pages/manageConditions/curfew/input', {
      additionalConditionCode: additionalCondition.code,
      reviewPeriod: getFieldValue('reviewPeriod'),
      alternativeReviewPeriod: getFieldValue('alternativeReviewPeriod') || null,
      numberOfCurfews,
      curfews,
      config,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { conditionCode } = req.params
    const { user, licence } = res.locals
    const inputs = req.body

    const numberOfCurfews = parseInt(inputs.numberOfCurfews, 10)
    const curfews = inputs.curfews || []
    console.log('curfews==========>', curfews)

    const { reviewPeriod, alternativeReviewPeriod } = inputs

    await this.licenceService.deleteAdditionalConditionsByCode([conditionCode], licence.id, user)

    await (async () => {
      for await (const curfew of curfews) {
        const { start, end } = curfew

        if (start && end) {
          await this.addCurfewCondition(
            licence,
            user,
            conditionCode,
            new SimpleTime(start.hour, start.minute, start.ampm),
            new SimpleTime(end.hour, end.minute, end.ampm),
            this.getCurfewLabel(numberOfCurfews),
            reviewPeriod,
            alternativeReviewPeriod,
          )
        }
      }
    })()

    // const redirectUrl = `/licence/create/id/${licence.id}/additional-licence-conditions/callback${
    //   req.query?.fromReview ? '?fromReview=true' : ''
    // }`

    // return res.redirect(redirectUrl)
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
      alternativeReviewPeriod: reviewPeriod === 'Other' ? alternativeReviewPeriod : '',
    }

    await this.licenceService.updateAdditionalConditionData(
      licence.id.toString(),
      licenceCondition,
      conditionData,
      user,
    )
  }

  getCurfewLabel = (count: number): CurfewType =>
    Object.entries(curfewCountMap).find(([_, value]) => value === count)?.[0] as CurfewType
}
