import { expandAdditionalConditions } from './conditionsProvider'
import { AdditionalCondition } from '../@types/licenceApiClientTypes'

describe('Conditions Provider - expansions', () => {
  describe('expandAdditionalConditions', () => {
    it('Will accept and return an empty list', () => {
      const conditions: AdditionalCondition[] = []
      const listOfConditions = expandAdditionalConditions(conditions)
      expect(listOfConditions).toHaveLength(0)
    })

    it('Will return text verbatim when no placeholders exist', () => {
      const conditions: AdditionalCondition[] = [
        {
          id: 1,
          code: 'ed607a91-fe3a-4816-8eb9-b447c945935c',
          category: 'Possession, ownership, control or inspection of specified items or documents',
          sequence: 1,
          text: 'Not to own or use a camera without the prior approval of your supervising officer.',
          data: [],
        },
      ]
      const listOfConditions = expandAdditionalConditions(conditions)
      expect(listOfConditions).toHaveLength(1)
      expect(listOfConditions[0]).toEqual(conditions[0].text)
    })

    it('Will replace single placeholder with a single value', () => {
      const conditions: AdditionalCondition[] = [
        {
          id: 1,
          code: '5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd',
          category: 'Residence at a specific place',
          sequence: 0,
          text: 'You must reside within [INSERT REGION] while of no fixed abode, unless otherwise approved by your supervising officer.',
          data: [{ id: 1, field: 'probationRegion', value: 'london', sequence: 0 }],
        },
      ]
      const listOfConditions = expandAdditionalConditions(conditions)
      expect(listOfConditions).toHaveLength(1)
      expect(listOfConditions[0]).toEqual(
        'You must reside within London while of no fixed abode, unless otherwise approved by your supervising officer.'
      )
    })

    it('Will remove optional placeholders that are not matched by data', () => {
      const conditions: AdditionalCondition[] = [
        {
          id: 1,
          code: '5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd',
          category: 'Residence at a specific place',
          sequence: 0,
          text: 'You must reside within [INSERT REGION] while of no fixed abode, unless otherwise approved by your supervising officer.',
          data: [{ id: 1, field: 'wrongName', value: 'london', sequence: 0 }],
        },
      ]
      const listOfConditions = expandAdditionalConditions(conditions)
      expect(listOfConditions).toHaveLength(1)
      // The two consecutive spaces are expected here
      expect(listOfConditions[0]).toEqual(
        'You must reside within  while of no fixed abode, unless otherwise approved by your supervising officer.'
      )
    })

    it('Will replace placeholders of type number', () => {
      const conditions: AdditionalCondition[] = [
        {
          id: 1,
          code: '9da214a3-c6ae-45e1-a465-12e22adf7c87',
          category: 'Participation in, or co-operation with, a programme or set of activities',
          sequence: 1,
          text: 'Not to undertake work or other organised activity which will involve a person under the age of [INSERT AGE], either on a paid or unpaid basis without the prior approval of your supervising officer.',
          data: [{ id: 1, field: 'age', value: '18', sequence: 0 }],
        },
      ]

      const listOfConditions = expandAdditionalConditions(conditions)
      expect(listOfConditions).toHaveLength(1)
      expect(listOfConditions[0]).toEqual(
        'Not to undertake work or other organised activity which will involve a person under the age of 18, either on a paid or unpaid basis without the prior approval of your supervising officer.'
      )
    })

    it('Will replace multiple placeholders and adjust case to lower', () => {
      const conditions: AdditionalCondition[] = [
        {
          id: 1,
          code: 'fce34fb2-02f4-4eb0-9b8d-d091e11451fa',
          category: 'Restriction of residency',
          sequence: 1,
          text: 'Not to reside (not even to stay for one night) in the same household as [ANY / ANY FEMALE / ANY MALE] child under the age of [INSERT AGE] without the prior approval of your supervising officer.',
          data: [
            { id: 1, field: 'gender', value: 'Any', sequence: 0 },
            { id: 2, field: 'age', value: '18', sequence: 1 },
          ],
        },
      ]
      const listOfConditions = expandAdditionalConditions(conditions)
      expect(listOfConditions).toHaveLength(1)
      expect(listOfConditions[0]).toEqual(
        'Not to reside (not even to stay for one night) in the same household as any child under the age of 18 without the prior approval of your supervising officer.'
      )
    })

    it('Will replace placeholders for a list of 2 values with "and" between', () => {
      const conditions: AdditionalCondition[] = [
        {
          id: 1,
          code: '89e656ec-77e8-4832-acc4-6ec05d3e9a98',
          category: 'Participation in, or co-operation with, a programme or set of activities',
          sequence: 1,
          text: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your [ALCOHOL / DRUG / SEXUAL / VIOLENT / GAMBLING / SOLVENT ABUSE / ANGER / DEBT / PROLIFIC / OFFENDING BEHAVIOUR] problems.',
          data: [
            { id: 1, field: 'behaviourProblems', value: 'alcohol', sequence: 0 },
            { id: 2, field: 'behaviourProblems', value: 'drug', sequence: 1 },
          ],
        },
      ]
      const listOfConditions = expandAdditionalConditions(conditions)
      expect(listOfConditions).toHaveLength(1)
      expect(listOfConditions[0]).toEqual(
        'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol and drug problems.'
      )
    })

    it('Will replace placeholders for a list of values with "commas" and "and" between', () => {
      const conditions: AdditionalCondition[] = [
        {
          id: 1,
          code: '89e656ec-77e8-4832-acc4-6ec05d3e9a98',
          category: 'Participation in, or co-operation with, a programme or set of activities',
          sequence: 1,
          text: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your [ALCOHOL / DRUG / SEXUAL / VIOLENT / GAMBLING / SOLVENT ABUSE / ANGER / DEBT / PROLIFIC / OFFENDING BEHAVIOUR] problems.',
          data: [
            { id: 1, field: 'behaviourProblems', value: 'alcohol', sequence: 0 },
            { id: 2, field: 'behaviourProblems', value: 'drug', sequence: 1 },
            { id: 3, field: 'behaviourProblems', value: 'sexual', sequence: 2 },
            { id: 4, field: 'behaviourProblems', value: 'violent', sequence: 3 },
            { id: 5, field: 'behaviourProblems', value: 'gambling', sequence: 4 },
            { id: 6, field: 'behaviourProblems', value: 'anger', sequence: 5 },
          ],
        },
      ]
      const listOfConditions = expandAdditionalConditions(conditions)
      expect(listOfConditions).toHaveLength(1)
      expect(listOfConditions[0]).toEqual(
        'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol, drug, sexual, violent, gambling and anger problems.'
      )
    })
  })
})
