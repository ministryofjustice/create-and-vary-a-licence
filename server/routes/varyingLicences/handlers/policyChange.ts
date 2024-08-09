import { Response, Request } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceType from '../../../enumeration/licenceType'
import { AddAdditionalConditionRequest, AdditionalCondition } from '../../../@types/licenceApiClientTypes'
import ConditionService, { PolicyAdditionalCondition } from '../../../services/conditionService'
import policyChangeHintText from '../../../config/policyChangeHintText'
import conditionChangeType from '../../../enumeration/conditionChangeType'
import { AdditionalConditionAp, AdditionalConditionPss } from '../../../@types/LicencePolicy'

export default class PolicyChangeRoutes {
  constructor(
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
      (await this.licenceService.getParentLicenceOrSelf(parseInt(licenceId, 10), user)).version
    )

    let additionalLicenceConditions: AdditionalCondition[] = []
    if (conditionType === LicenceType.AP) {
      additionalLicenceConditions = licence.additionalLicenceConditions
    } else if (conditionType === LicenceType.PSS) {
      additionalLicenceConditions = licence.additionalPssConditions
    }

    const inputs: string[] = []
    const licenceConditionCodes = additionalLicenceConditions.map((c: AdditionalCondition) => c.code)
    const conditionsToAdd: PolicyAdditionalCondition[] = []

    // if the condition is being replaced by new condition(s)
    if (condition.changeType === conditionChangeType.DELETED || condition.changeType === conditionChangeType.REPLACED) {
      const replacedByCodes = condition.suggestions.map((replacement: { code: string }) => replacement.code)

      // Remove replaced condition and any previously-selected replacements
      // Previously selected replacements removed to allow user to go back and unselect or reselect erroneous changes
      const conditionsToDelete = licenceConditionCodes
        .filter(code => code === condition.code || replacedByCodes.includes(code))
        .filter(code => !req.body.additionalConditions?.includes(code))

      this.licenceService.deleteAdditionalConditionsByCode(conditionsToDelete, licence.id, user)

      // Add replacement conditions
      if (req.body.additionalConditions?.length > 0) {
        await Promise.all(
          await req.body.additionalConditions.map(async (code: string) => {
            const conditionToAdd = await this.conditionService.getAdditionalConditionByCode(code, licence.version)

            if (!licenceConditionCodes.includes(code)) {
              conditionsToAdd.push(conditionToAdd)
            }

            if (conditionToAdd.requiresInput) {
              inputs.push(conditionToAdd.code)
            }
          })
        )
      }
    } else if (
      condition.changeType === conditionChangeType.NEW_OPTIONS ||
      condition.changeType === conditionChangeType.TEXT_CHANGE
    ) {
      const policyCondition = await this.conditionService.getAdditionalConditionByCode(condition.code, licence.version)

      if (!licenceConditionCodes.includes(condition.code)) {
        conditionsToAdd.push(policyCondition)
      }

      if (policyCondition.requiresInput) {
        inputs.push(condition.code)
      } else {
        // Removes any now-unused user-entered data
        await this.licenceService.updateAdditionalConditionData(
          licenceId,
          additionalLicenceConditions.find((c: AdditionalCondition) => c.code === condition.code),
          {},
          user
        )
      }

      // Update condition text to match new policy version
      await this.licenceService.updateAdditionalConditions(
        licence.id,
        conditionType,
        { additionalConditions: licenceConditionCodes },
        user,
        licence.version
      )
    }

    await Promise.all(
      conditionsToAdd.map(async (conditionToAdd: PolicyAdditionalCondition) => {
        const sequence = this.conditionService.currentOrNextSequenceForCondition(
          licence.additionalLicenceConditions,
          conditionToAdd.code
        )
        const type = await this.conditionService.getAdditionalConditionType(conditionToAdd.code, licence.version)

        const request = {
          conditionCode: conditionToAdd.code,
          conditionCategory: conditionToAdd?.categoryShort || conditionToAdd?.category,
          conditionText: conditionToAdd.text,
          conditionType: type,
          expandedText: conditionToAdd.tpl,
          sequence,
        } as AddAdditionalConditionRequest

        return this.licenceService.addAdditionalCondition(licenceId, type, request, user)
      })
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
        (await this.licenceService.getParentLicenceOrSelf(parseInt(licenceId, 10), user)).version
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
