export const MEZ_CONDITION_CODE = '0f9a20f4-35c7-4c77-8af8-f200f153fa11'
export const OUT_OF_BOUNDS_PREMISES_CONDITION_CODE = '42f71b40-84cd-446d-8647-f00bbb6c079c'
export const CURFEW_CONDITION_CODE = '0a370862-5426-49c1-b6d4-3d074d78a81a'

type ConditionCallbackHrefArgs = {
  licenceId: string
  conditionId: number
  conditionCode: string
  fromReview: boolean
}

type EditConditionHrefArgs = {
  licenceId: number
  conditionId: number
  conditionCode: string
  fromReview: boolean
}

type ConditionConfig = {
  inputTemplate: string
  getConditionCallbackHref: (args: ConditionCallbackHrefArgs) => string
  getEditConditionHref: (args: EditConditionHrefArgs) => string
}

const DEFAULT_CONDITION_CONFIG: ConditionConfig = {
  inputTemplate: 'pages/manageConditions/additionalLicenceConditionInput',
  getConditionCallbackHref: (args: ConditionCallbackHrefArgs) =>
    `/licence/create/id/${args.licenceId}/additional-licence-conditions/condition/${args.conditionId}${
      args.fromReview ? '?fromReview=true' : ''
    }`,
  getEditConditionHref: (args: EditConditionHrefArgs) =>
    `/licence/create/id/${args.licenceId}/additional-licence-conditions/condition/${args.conditionId}${
      args.fromReview ? '?fromReview=true' : ''
    }`,
}

const conditions: Record<string, ConditionConfig> = {
  [MEZ_CONDITION_CODE]: {
    inputTemplate: 'pages/manageConditions/fileUploads/input',
    getConditionCallbackHref: (args: ConditionCallbackHrefArgs) =>
      `/licence/create/id/${args.licenceId}/additional-licence-conditions/condition/${args.conditionId}${
        args.fromReview ? '?fromReview=true' : ''
      }`,
    getEditConditionHref: (args: EditConditionHrefArgs) =>
      `/licence/create/id/${args.licenceId}/additional-licence-conditions/condition/${args.conditionCode}/file-uploads${
        args.fromReview ? '?fromReview=true' : ''
      }`,
  },
  [OUT_OF_BOUNDS_PREMISES_CONDITION_CODE]: {
    inputTemplate: 'pages/manageConditions/outOfBoundsPremises/input',
    getConditionCallbackHref: (args: ConditionCallbackHrefArgs) =>
      `/licence/create/id/${args.licenceId}/additional-licence-conditions/condition/${args.conditionId}${
        args.fromReview ? '?fromReview=true' : ''
      }`,
    getEditConditionHref: (args: EditConditionHrefArgs) =>
      `/licence/create/id/${args.licenceId}/additional-licence-conditions/condition/${
        args.conditionCode
      }/outofbounds-premises${args.fromReview ? '?fromReview=true' : ''}`,
  },
  [CURFEW_CONDITION_CODE]: {
    inputTemplate: 'pages/manageConditions/curfew/input',
    getConditionCallbackHref: (args: ConditionCallbackHrefArgs) =>
      `/licence/create/id/${args.licenceId}/additional-licence-conditions/condition/${args.conditionCode}/curfew${
        args.fromReview ? '?fromReview=true' : ''
      }`,
    getEditConditionHref: (args: EditConditionHrefArgs) =>
      `/licence/create/id/${args.licenceId}/additional-licence-conditions/condition/${args.conditionCode}/curfew${
        args.fromReview ? '?fromReview=true' : ''
      }`,
  },
}

export const getConfigForCondition = (conditionCode: string) => conditions[conditionCode] || DEFAULT_CONDITION_CONFIG

export const getConditionCallbackHref = (args: ConditionCallbackHrefArgs) => {
  const config = getConfigForCondition(args.conditionCode)
  return config.getConditionCallbackHref(args)
}

export const getEditConditionHref = (args: EditConditionHrefArgs) => {
  const config = getConfigForCondition(args.conditionCode)
  return config.getEditConditionHref(args)
}
