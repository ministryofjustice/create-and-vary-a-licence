import {
  MEZ_CONDITION_CODE,
  CURFEW_CONDITION_CODE,
  getConditionCallbackHref,
  getEditConditionHref,
  OUT_OF_BOUNDS_PREMISES_CONDITION_CODE,
} from './conditionRoutes'

describe('conditionRoutes', () => {
  describe('getConditionCallbackHref', () => {
    test('standard condition, from review', () => {
      expect(
        getConditionCallbackHref({
          licenceId: '1',
          conditionId: 2,
          conditionCode: 'some-code',
          fromReview: true,
        }),
      ).toStrictEqual('/licence/create/id/1/additional-licence-conditions/condition/2?fromReview=true')
    })

    test('standard condition, not from review', () => {
      expect(
        getConditionCallbackHref({
          licenceId: '1',
          conditionId: 2,
          conditionCode: 'some-code',
          fromReview: false,
        }),
      ).toStrictEqual('/licence/create/id/1/additional-licence-conditions/condition/2')
    })

    test('Out of bounds premises, from review', () => {
      expect(
        getConditionCallbackHref({
          licenceId: '1',
          conditionId: 2,
          conditionCode: OUT_OF_BOUNDS_PREMISES_CONDITION_CODE,
          fromReview: true,
        }),
      ).toStrictEqual('/licence/create/id/1/additional-licence-conditions/condition/2?fromReview=true')
    })

    test('Out of bounds premises, not from review', () => {
      expect(
        getConditionCallbackHref({
          licenceId: '1',
          conditionId: 2,
          conditionCode: OUT_OF_BOUNDS_PREMISES_CONDITION_CODE,
          fromReview: false,
        }),
      ).toStrictEqual('/licence/create/id/1/additional-licence-conditions/condition/2')
    })

    test('Curfew, from review', () => {
      expect(
        getConditionCallbackHref({
          licenceId: '1',
          conditionId: 2,
          conditionCode: CURFEW_CONDITION_CODE,
          fromReview: true,
        }),
      ).toStrictEqual(
        `/licence/create/id/1/additional-licence-conditions/condition/${CURFEW_CONDITION_CODE}/curfew?fromReview=true`,
      )
    })

    test('Curfew, not from review', () => {
      expect(
        getConditionCallbackHref({
          licenceId: '1',
          conditionId: 2,
          conditionCode: CURFEW_CONDITION_CODE,
          fromReview: false,
        }),
      ).toStrictEqual(`/licence/create/id/1/additional-licence-conditions/condition/${CURFEW_CONDITION_CODE}/curfew`)
    })
  })

  describe('getEditConditionHref', () => {
    test('standard condition, from review', () => {
      expect(
        getEditConditionHref({
          licenceId: 1,
          conditionId: 2,
          conditionCode: 'some-code',
          fromReview: true,
        }),
      ).toStrictEqual('/licence/create/id/1/additional-licence-conditions/condition/2?fromReview=true')
    })

    test('standard condition, not from review', () => {
      expect(
        getEditConditionHref({
          licenceId: 1,
          conditionId: 2,
          conditionCode: 'some-code',
          fromReview: false,
        }),
      ).toStrictEqual('/licence/create/id/1/additional-licence-conditions/condition/2')
    })

    test('MEZ condition, from review', () => {
      expect(
        getEditConditionHref({
          licenceId: 1,
          conditionId: 2,
          conditionCode: MEZ_CONDITION_CODE,
          fromReview: true,
        }),
      ).toStrictEqual(
        `/licence/create/id/1/additional-licence-conditions/condition/${MEZ_CONDITION_CODE}/file-uploads?fromReview=true`,
      )
    })

    test('MEZ condition, not from review', () => {
      expect(
        getEditConditionHref({
          licenceId: 1,
          conditionId: 2,
          conditionCode: MEZ_CONDITION_CODE,
          fromReview: false,
        }),
      ).toStrictEqual(`/licence/create/id/1/additional-licence-conditions/condition/${MEZ_CONDITION_CODE}/file-uploads`)
    })
  })
})
