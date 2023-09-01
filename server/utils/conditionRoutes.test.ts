import { MEZ_CONDITION_CODE, getEditConditionHref } from './conditionRoutes'

describe('conditionRoutes', () => {
  test('standard condition, from review', () => {
    expect(
      getEditConditionHref({
        licenceId: 1,
        conditionId: 2,
        conditionCode: 'some-code',
        fromReview: true,
      })
    ).toStrictEqual('/licence/create/id/1/additional-licence-conditions/condition/2?fromReview=true')
  })

  test('standard condition, not from review', () => {
    expect(
      getEditConditionHref({
        licenceId: 1,
        conditionId: 2,
        conditionCode: 'some-code',
        fromReview: false,
      })
    ).toStrictEqual('/licence/create/id/1/additional-licence-conditions/condition/2')
  })

  test('MEZ condition, from review', () => {
    expect(
      getEditConditionHref({
        licenceId: 1,
        conditionId: 2,
        conditionCode: MEZ_CONDITION_CODE,
        fromReview: true,
      })
    ).toStrictEqual(
      `/licence/create/id/1/additional-licence-conditions/condition/${MEZ_CONDITION_CODE}/file-uploads?fromReview=true`
    )
  })

  test('MEZ condition, not from review', () => {
    expect(
      getEditConditionHref({
        licenceId: 1,
        conditionId: 2,
        conditionCode: MEZ_CONDITION_CODE,
        fromReview: false,
      })
    ).toStrictEqual(`/licence/create/id/1/additional-licence-conditions/condition/${MEZ_CONDITION_CODE}/file-uploads`)
  })
})
