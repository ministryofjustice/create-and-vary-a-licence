import { Response, Request } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceType from '../../../enumeration/licenceType'
import { AdditionalCondition } from '../../../@types/licenceApiClientTypes'
import ConditionService, { Condition } from '../../../services/conditionService'
import policyChangeHintText from '../../../config/policyChangeHintText'

export default class PolicyChangeRoutes {
  constructor(private readonly licenceService: LicenceService, private readonly conditionService: ConditionService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    const { licenceId, changeCounter } = req.params

    const conditionCounter = +changeCounter
    const policyChangesCount = req.session.changedConditions.length
    const condition = req.session.changedConditions[conditionCounter - 1]
    let conditionHintText

    if (condition) {
      conditionHintText = policyChangeHintText[condition.code][this.formatVersionNumber('2.1')]
    }

    // Overriding session changeCounter for when the back link is clicked
    req.session.changedConditionsCounter = conditionCounter

    if (conditionCounter === 0) {
      return res.redirect(`/licence/vary/id/${licenceId}/policy-changes`)
    }

    if (!condition.currentText) {
      const replacements = await Promise.all(
        condition.replacedBy?.map(async (replacement: { code: string }) =>
          this.conditionService.getAdditionalConditionByCode(replacement.code)
        )
      )

      const replacementsInParentPolicyVersion = await Promise.all(
        replacements.map(
          async replacement =>
            (
              await this.conditionService.getAdditionalConditionByCode(
                replacement.code,
                (
                  await this.licenceService.getParentLicenceOrSelf(licenceId, user)
                ).version
              )
            ).code
        )
      )

      if (
        replacements?.every((replacement: Condition) => replacementsInParentPolicyVersion.includes(replacement.code))
      ) {
        return res.render('pages/vary/policyConditionDeleted', {
          licenceId,
          conditionCounter,
          policyChangesCount,
          condition,
          conditionHintText,
          replacements,
        })
      }
      return res.render('pages/vary/policyConditionReplaced', {
        licenceId,
        conditionCounter,
        policyChangesCount,
        condition,
        conditionHintText,
        replacements,
      })
    }
    if (condition.currentText === condition.previousText) {
      return res.render('pages/vary/policyNewOptions', {
        licenceId,
        conditionCounter,
        policyChangesCount,
        conditionHintText,
        condition,
      })
    }

    return res.render('pages/vary/policyTextChange', {
      licenceId,
      conditionCounter,
      policyChangesCount,
      conditionHintText,
      condition,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    const { licenceId, changeCounter } = req.params

    const conditionCounter = +changeCounter
    const condition = req.session.changedConditions[conditionCounter - 1]
    const conditionType: LicenceType = await this.conditionService.getAdditionalConditionType(
      condition.code,
      (
        await this.licenceService.getParentLicenceOrSelf(licenceId, user)
      ).version
    )

    let additionalLicenceConditions: AdditionalCondition[] = []
    if (conditionType === LicenceType.AP) {
      additionalLicenceConditions = licence.additionalLicenceConditions
    } else if (conditionType === LicenceType.PSS) {
      additionalLicenceConditions = licence.additionalPssConditions
    }
    const licenceCondition = additionalLicenceConditions.find((c: AdditionalCondition) => c.code === condition.code)

    const inputs = []
    let licenceConditionCodes = additionalLicenceConditions.map((c: AdditionalCondition) => c.code)
    const changeType =
      condition.replacedBy !== undefined && condition.replacedBy.length >= 1 ? 'replacement' : 'textChange'

    // if the condition is being replaced by new condition(s)
    if (changeType === 'replacement') {
      const replacedByCodes = condition.replacedBy.map((replacement: { code: string }) => replacement.code)

      // Remove replaced condition and any previously-selected replacements
      // Previously selected replacements removed to allow user to go back and unselect or reselect erroneous changes
      licenceConditionCodes = licenceConditionCodes
        .filter((code: string) => code !== condition.code)
        .filter((code: string) => !replacedByCodes.includes(code))

      // Add replacement conditions
      req.body.additionalConditions?.forEach(async (code: string) => {
        licenceConditionCodes.push(code)
        const replacement = await this.conditionService.getAdditionalConditionByCode(code)
        if (replacement.requiresInput) {
          inputs.push(code)
        }
      })
    } else if (
      changeType === 'textChange' &&
      (await this.conditionService.getAdditionalConditionByCode(licenceCondition.code)).requiresInput
    ) {
      inputs.push(licenceCondition.code)
    } else if (changeType === 'textChange') {
      await this.licenceService.updateAdditionalConditionData(
        licenceId,
        additionalLicenceConditions.find((c: AdditionalCondition) => c.code === condition.code),
        {},
        user
      )
    }

    await this.licenceService.updateAdditionalConditions(
      licence.id,
      conditionType,
      { additionalConditions: licenceConditionCodes },
      user
    )

    req.session.changedConditionsInputs = inputs
    req.session.changedConditionsInputsCounter = 0

    return res.redirect(`/licence/vary/id/${licenceId}/policy-changes/input/callback/1`)
  }

  DELETE = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    const { licenceId, changeCounter } = req.params

    const counter = +changeCounter
    const conditionCode = req.session.changedConditions[counter - 1].code
    const conditionType: LicenceType = await this.conditionService.getAdditionalConditionType(conditionCode)

    let additionalConditionCodes: string[] = []

    if (conditionType === LicenceType.AP) {
      additionalConditionCodes = licence.additionalLicenceConditions
        .filter((c: AdditionalCondition) => c.code !== conditionCode)
        .map((condition: AdditionalCondition) => condition.code)
    } else if (conditionType === LicenceType.PSS) {
      additionalConditionCodes = licence.additionalPssConditions
        .filter((c: AdditionalCondition) => c.code !== conditionCode)
        .map((condition: AdditionalCondition) => condition.code)
    }

    await this.licenceService.updateAdditionalConditions(
      licence.id,
      conditionType,
      { additionalConditions: additionalConditionCodes },
      user
    )

    return res.redirect(`/licence/vary/id/${licenceId}/policy-changes/callback`)
  }

  formatVersionNumber = (version: string): string => {
    return `v${version.replace('.', '_')}`
  }
}
