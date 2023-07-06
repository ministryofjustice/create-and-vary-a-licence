import { Response, Request } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceType from '../../../enumeration/licenceType'
import { AdditionalCondition } from '../../../@types/licenceApiClientTypes'
import ConditionService from '../../../services/conditionService'
import policyChangeHintText from '../../../config/policyChangeHintText'
import conditionChangeType from '../../../enumeration/conditionChangeType'
import { AdditionalConditionAp, AdditionalConditionPss } from '../../../@types/LicencePolicy'
import { LicenceApiClient } from '../../../data'

export default class PolicyChangeRoutes {
  constructor(
    private readonly licenceApiClient: LicenceApiClient,
    private readonly licenceService: LicenceService,
    private readonly conditionService: ConditionService
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId, changeCounter } = req.params
    const { licence } = res.locals

    const conditionCounter = +changeCounter
    const policyChangesCount = req.session.changedConditions.length
    const condition = req.session.changedConditions[conditionCounter - 1]

    let conditionHintText
    if (condition && policyChangeHintText[condition.code]) {
      conditionHintText = policyChangeHintText[condition.code][this.formatVersionNumber('2.1')]
    }

    // Overriding session changeCounter for when the back link is clicked
    req.session.changedConditionsCounter = conditionCounter

    if (conditionCounter === 0) {
      return res.redirect(`/licence/vary/id/${licenceId}/policy-changes`)
    }

    let replacements: AdditionalConditionAp[] | AdditionalConditionPss[] = []
    if (condition.suggestions) {
      replacements = await Promise.all(
        condition.suggestions?.map(async (replacement: { code: string }) =>
          this.conditionService.getAdditionalConditionByCode(replacement.code, licence.version)
        )
      )
    }

    switch (condition.changeType) {
      case conditionChangeType.DELETED:
        return res.render('pages/vary/policyConditionDeleted', {
          licenceId,
          conditionCounter,
          policyChangesCount,
          condition,
          conditionHintText,
          replacements,
        })
      case conditionChangeType.REPLACED:
        return res.render('pages/vary/policyConditionReplaced', {
          licenceId,
          conditionCounter,
          policyChangesCount,
          condition,
          conditionHintText,
          replacements,
        })
      case conditionChangeType.NEW_OPTIONS:
        return res.render('pages/vary/policyNewOptions', {
          licenceId,
          conditionCounter,
          policyChangesCount,
          conditionHintText,
          condition,
        })
      // Default to TEXT_CHANGE in case something is wrong with the returned type
      default:
        return res.render('pages/vary/policyTextChange', {
          licenceId,
          conditionCounter,
          policyChangesCount,
          conditionHintText,
          condition,
        })
    }
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    const { licenceId, changeCounter } = req.params

    const conditionCounter = +changeCounter
    const condition = req.session.changedConditions[conditionCounter - 1]
    const conditionType: LicenceType = await this.conditionService.getAdditionalConditionType(
      condition.code,
      (
        await this.licenceApiClient.getParentLicenceOrSelf(licenceId, user)
      ).version
    )

    let additionalLicenceConditions: AdditionalCondition[] = []
    if (conditionType === LicenceType.AP) {
      additionalLicenceConditions = licence.additionalLicenceConditions
    } else if (conditionType === LicenceType.PSS) {
      additionalLicenceConditions = licence.additionalPssConditions
    }

    const inputs = []
    let licenceConditionCodes = additionalLicenceConditions.map((c: AdditionalCondition) => c.code)

    // if the condition is being replaced by new condition(s)
    if (condition.changeType === conditionChangeType.DELETED || condition.changeType === conditionChangeType.REPLACED) {
      const replacedByCodes = condition.suggestions.map((replacement: { code: string }) => replacement.code)

      // Remove replaced condition and any previously-selected replacements
      // Previously selected replacements removed to allow user to go back and unselect or reselect erroneous changes
      licenceConditionCodes = licenceConditionCodes
        .filter((code: string) => code !== condition.code)
        .filter((code: string) => !replacedByCodes.includes(code))

      // Add replacement conditions
      if (req.body.additionalConditions?.length > 0) {
        const replacementArray = await Promise.all(
          req.body.additionalConditions.map((code: string) => {
            return this.conditionService.getAdditionalConditionByCode(code, licence.version)
          })
        )

        replacementArray.forEach(replacement => {
          licenceConditionCodes.push(replacement.code)
          if (replacement.requiresInput) {
            inputs.push(replacement.code)
          }
        })
      }
    } else if (
      condition.changeType === conditionChangeType.NEW_OPTIONS ||
      (condition.changeType === conditionChangeType.TEXT_CHANGE &&
        (await this.conditionService.getAdditionalConditionByCode(condition.code, licence.version)).requiresInput)
    ) {
      if (!licenceConditionCodes.includes(condition.code)) {
        licenceConditionCodes.push(condition.code)
      }
      inputs.push(condition.code)
    } else if (condition.changeType === conditionChangeType.TEXT_CHANGE) {
      if (!licenceConditionCodes.includes(condition.code)) {
        licenceConditionCodes.push(condition.code)
      }
      // Removes any now-unused user-entered data
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
      user,
      licence.version
    )

    req.session.changedConditionsInputs = inputs
    req.session.changedConditionsInputsCounter = 0

    return res.redirect(`/licence/vary/id/${licenceId}/policy-changes/input/callback/1`)
  }

  DELETE = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    const { licenceId, changeCounter } = req.params

    if (req.body['confirm-delete'] === 'yes') {
      const counter = +changeCounter
      const conditionCode = req.session.changedConditions[counter - 1].code
      const conditionType: LicenceType = await this.conditionService.getAdditionalConditionType(
        conditionCode,
        (
          await this.licenceApiClient.getParentLicenceOrSelf(licenceId, user)
        ).version
      )

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
        user,
        licence.version
      )
    } else {
      req.session.changedConditionsCounter -= 1
    }

    return res.redirect(`/licence/vary/id/${licenceId}/policy-changes/callback`)
  }

  formatVersionNumber = (version: string): string => {
    return `v${version.replace('.', '_')}`
  }
}
