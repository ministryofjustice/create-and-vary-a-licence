export const MEZ_CONDITION_CODE = '0f9a20f4-35c7-4c77-8af8-f200f153fa11'

type Args = {
  licenceId: number
  conditionId: number
  conditionCode: string
  fromReview: boolean
}

export const getEditConditionHref = ({ licenceId, conditionCode, conditionId, fromReview }: Args) => {
  switch (conditionCode) {
    case MEZ_CONDITION_CODE:
      return `/licence/create/id/${licenceId}/additional-licence-conditions/condition/${conditionCode}/file-uploads${
        fromReview ? '?fromReview=true' : ''
      }`
    default:
      return `/licence/create/id/${licenceId}/additional-licence-conditions/condition/${conditionId}${
        fromReview ? '?fromReview=true' : ''
      }`
  }
}
