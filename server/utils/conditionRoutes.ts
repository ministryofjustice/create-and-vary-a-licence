export const MEZ_CONDITION_CODE = '0f9a20f4-35c7-4c77-8af8-f200f153fa11'

type EditConditionHrefArgs = {
  licenceId: number
  conditionId: number
  conditionCode: string
  fromReview: boolean
}

type ConditionConfig = {
  inputTemplate: string
  getEditConditionHref: (args: EditConditionHrefArgs) => string
}

const DEFAULT_CONDITION_CONFIG: ConditionConfig = {
  inputTemplate: 'pages/create/additionalLicenceConditionInput',
  getEditConditionHref: (args: EditConditionHrefArgs) =>
    `/licence/create/id/${args.licenceId}/additional-licence-conditions/condition/${args.conditionId}${
      args.fromReview ? '?fromReview=true' : ''
    }`,
}

const conditions: Record<string, ConditionConfig> = {
  [MEZ_CONDITION_CODE]: {
    inputTemplate: 'pages/create/additionalLicenceConditionInput',
    getEditConditionHref: (args: EditConditionHrefArgs) =>
      `/licence/create/id/${args.licenceId}/additional-licence-conditions/condition/${args.conditionCode}/file-uploads${
        args.fromReview ? '?fromReview=true' : ''
      }`,
  },
}

export const getConfigForCondition = (conditionCode: string) => conditions[conditionCode] || DEFAULT_CONDITION_CONFIG

export const getEditConditionHref = (args: EditConditionHrefArgs) => {
  const config = getConfigForCondition(args.conditionCode)
  return config.getEditConditionHref(args)
}
