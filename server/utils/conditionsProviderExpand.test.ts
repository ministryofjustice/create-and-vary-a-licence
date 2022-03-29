import { AdditionalCondition } from '../@types/licenceApiClientTypes'
import { expandAdditionalCondition } from './conditionsProvider'

describe('Conditions Provider - expansions', () => {
  describe('expandAdditionalConditions', () => {
    it('Will return text verbatim when no placeholders exist', () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: 'ed607a91-fe3a-4816-8eb9-b447c945935c',
        category: 'Possession, ownership, control or inspection of specified items or documents',
        sequence: 1,
        text: 'Not to own or use a camera without the prior approval of your supervising officer.',
        data: [],
        uploadSummary: [],
      }

      const result = expandAdditionalCondition(condition.code, condition.data)
      expect(result).toEqual('Not to own or use a camera without the prior approval of your supervising officer.')
    })

    it('Will replace single placeholder with a single value', () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: '5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd',
        category: 'Residence at a specific place',
        sequence: 0,
        text: 'You must reside within [INSERT REGION] while of no fixed abode, unless otherwise approved by your supervising officer.',
        data: [{ id: 1, field: 'probationRegion', value: 'London', sequence: 0 }],
        uploadSummary: [],
      }

      const result = expandAdditionalCondition(condition.code, condition.data)
      expect(result).toEqual(
        'You must reside within the London probation region while of no fixed abode, unless otherwise approved by your supervising officer.'
      )
    })

    it('Will remove optional placeholders that are not matched by data', () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: '5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd',
        category: 'Residence at a specific place',
        sequence: 0,
        text: 'You must reside within [INSERT REGION] while of no fixed abode, unless otherwise approved by your supervising officer.',
        data: [{ id: 1, field: 'wrongName', value: 'London', sequence: 0 }],
        uploadSummary: [],
      }
      const result = expandAdditionalCondition(condition.code, condition.data)
      // The two consecutive spaces are expected here
      expect(result).toEqual(
        'You must reside within the  probation region while of no fixed abode, unless otherwise approved by your supervising officer.'
      )
    })

    it('Will replace placeholders of type number', () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: '9da214a3-c6ae-45e1-a465-12e22adf7c87',
        category: 'Participation in, or co-operation with, a programme or set of activities',
        sequence: 1,
        text: 'Not to undertake work or other organised activity which will involve a person under the age of [INSERT AGE], either on a paid or unpaid basis without the prior approval of your supervising officer.',
        data: [{ id: 1, field: 'age', value: '18', sequence: 0 }],
        uploadSummary: [],
      }

      const result = expandAdditionalCondition(condition.code, condition.data)
      expect(result).toEqual(
        'Not to undertake work or other organised activity which will involve a person under the age of 18, either on a paid or unpaid basis without the prior approval of your supervising officer.'
      )
    })

    it('Will replace multiple placeholders and adjust case to lower', () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: 'fce34fb2-02f4-4eb0-9b8d-d091e11451fa',
        category: 'Restriction of residency',
        sequence: 1,
        text: 'Not to reside (not even to stay for one night) in the same household as [ANY / ANY FEMALE / ANY MALE] child under the age of [INSERT AGE] without the prior approval of your supervising officer.',
        data: [
          { id: 1, field: 'gender', value: 'Any', sequence: 0 },
          { id: 2, field: 'age', value: '18', sequence: 1 },
        ],
        uploadSummary: [],
      }
      const result = expandAdditionalCondition(condition.code, condition.data)
      expect(result).toEqual(
        'Not to reside (not even to stay for one night) in the same household as any child under the age of 18 without the prior approval of your supervising officer.'
      )
    })

    it('Will replace placeholders for a list with and "and" between them and include optional text for optional values', () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: '89e656ec-77e8-4832-acc4-6ec05d3e9a98',
        category: 'Participation in, or co-operation with, a programme or set of activities',
        sequence: 1,
        text: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your [ALCOHOL / DRUG / SEXUAL / VIOLENT / GAMBLING / SOLVENT ABUSE / ANGER / DEBT / PROLIFIC / OFFENDING BEHAVIOUR] problems.',
        data: [
          { id: 1, field: 'behaviourProblems', value: 'alcohol', sequence: 0 },
          { id: 2, field: 'behaviourProblems', value: 'drug', sequence: 1 },
          { id: 3, field: 'course', value: 'Walthamstow Rehabilitation Clinic', sequence: 2 },
        ],
        uploadSummary: [],
      }

      const result = expandAdditionalCondition(condition.code, condition.data)
      expect(result).toEqual(
        'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol and drug problems at the Walthamstow Rehabilitation Clinic.'
      )
    })

    it('Will omit optional text from the sentence when an optional value is not supplied', () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: '89e656ec-77e8-4832-acc4-6ec05d3e9a98',
        category: 'Participation in, or co-operation with, a programme or set of activities',
        sequence: 1,
        text: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your [ALCOHOL / DRUG / SEXUAL / VIOLENT / GAMBLING / SOLVENT ABUSE / ANGER / DEBT / PROLIFIC / OFFENDING BEHAVIOUR] problems.',
        data: [
          { id: 1, field: 'behaviourProblems', value: 'alcohol', sequence: 0 },
          { id: 2, field: 'behaviourProblems', value: 'drug', sequence: 1 },
        ],
        uploadSummary: [],
      }
      const result = expandAdditionalCondition(condition.code, condition.data)
      expect(result).toEqual(
        'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol and drug problems.'
      )
    })

    it('Will make sense with multiple optional values - none supplied', () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: 'a7c57e4e-30fe-4797-9fe7-70a35dbd7b65',
        category: 'Making or maintaining contact with a person',
        sequence: 1,
        text: 'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
        data: [
          { id: 1, field: 'appointmentAddress', value: 'Harlow Clinic, High Street, London, W1 3GV', sequence: 0 },
        ],
        uploadSummary: [],
      }

      const result = expandAdditionalCondition(condition.code, condition.data)
      expect(result).toEqual(
        'Attend Harlow Clinic, High Street, London, W1 3GV, as directed, to address your dependency on, or propensity to misuse, a controlled drug.'
      )
    })

    it('Will make sense with multiple optional values - one supplied', () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: 'a7c57e4e-30fe-4797-9fe7-70a35dbd7b65',
        category: 'Making or maintaining contact with a person',
        sequence: 1,
        text: 'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
        data: [
          { id: 1, field: 'appointmentAddress', value: 'Harlow Clinic, High Street, London, W1 3GV', sequence: 0 },
          { id: 2, field: 'appointmentDate', value: '12th February 2022', sequence: 1 },
        ],
        uploadSummary: [],
      }
      const result = expandAdditionalCondition(condition.code, condition.data)
      expect(result).toEqual(
        'Attend Harlow Clinic, High Street, London, W1 3GV on 12th February 2022, as directed, to address your dependency on, or propensity to misuse, a controlled drug.'
      )
    })

    it('Will make sense with multiple optional values - two supplied', () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: 'a7c57e4e-30fe-4797-9fe7-70a35dbd7b65',
        category: 'Making or maintaining contact with a person',
        sequence: 1,
        text: 'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
        data: [
          { id: 1, field: 'appointmentAddress', value: 'Harlow Clinic, High Street, London, W1 3GV', sequence: 0 },
          { id: 2, field: 'appointmentDate', value: '12th February 2022', sequence: 1 },
          { id: 3, field: 'appointmentTime', value: '11:15 am', sequence: 2 },
        ],
        uploadSummary: [],
      }
      const result = expandAdditionalCondition(condition.code, condition.data)
      expect(result).toEqual(
        'Attend Harlow Clinic, High Street, London, W1 3GV on 12th February 2022 at 11:15 am, as directed, to address your dependency on, or propensity to misuse, a controlled drug.'
      )
    })

    it('Will replace placeholders for a list of values with commas and "and" between (list type AND)', () => {
      const condition: AdditionalCondition = {
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
          { id: 7, field: 'course', value: 'AA meeting', sequence: 6 },
        ],
        uploadSummary: [],
      }

      const result = expandAdditionalCondition(condition.code, condition.data)
      expect(result).toEqual(
        'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol, drug, sexual, violent, gambling and anger problems at the AA meeting.'
      )
    })

    it('Will replace placeholders for a list of 2 values with an "OR" between them (list type OR)', () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: '4858cd8b-bca6-4f11-b6ee-439e27216d7d',
        category: 'Making or maintaining contact with a person',
        sequence: 1,
        text: 'Not to seek to approach or communicate with [INSERT NAME OF VICTIM AND / OR FAMILY MEMBERS] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT].',
        data: [
          { id: 1, field: 'name', value: 'Jane Doe', sequence: 0 },
          { id: 2, field: 'name', value: 'John Doe', sequence: 1 },
          { id: 3, field: 'socialServicesDepartment', value: 'East Hull Social Services', sequence: 2 },
        ],
        uploadSummary: [],
      }
      const result = expandAdditionalCondition(condition.code, condition.data)
      expect(result).toEqual(
        'Not to seek to approach or communicate with Jane Doe or John Doe without the prior approval of your supervising officer and / or East Hull Social Services.'
      )
    })

    it('Will replace placeholders for a list of values with commas and an "OR" between them (list type OR)', () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: '4858cd8b-bca6-4f11-b6ee-439e27216d7d',
        category: 'Making or maintaining contact with a person',
        sequence: 1,
        text: 'Not to seek to approach or communicate with [INSERT NAME OF VICTIM AND / OR FAMILY MEMBERS] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT].',
        data: [
          { id: 1, field: 'name', value: 'Jane Doe', sequence: 0 },
          { id: 2, field: 'name', value: 'John Doe', sequence: 1 },
          { id: 3, field: 'name', value: 'Jack Dont', sequence: 2 },
          { id: 4, field: 'socialServicesDepartment', value: 'East Hull Social Services', sequence: 3 },
        ],
        uploadSummary: [],
      }
      const result = expandAdditionalCondition(condition.code, condition.data)
      expect(result).toEqual(
        'Not to seek to approach or communicate with Jane Doe, John Doe or Jack Dont without the prior approval of your supervising officer and / or East Hull Social Services.'
      )
    })

    it('Will correctly format an address', () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: 'a7c57e4e-30fe-4797-9fe7-70a35dbd7b65',
        category: 'Residence at a specific place',
        sequence: 1,
        text: 'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
        data: [{ id: 1, field: 'appointmentAddress', value: '123 Fake Street, , Fakestown, , LN123TO', sequence: 0 }],
        uploadSummary: [],
      }

      const result = expandAdditionalCondition(condition.code, condition.data)
      expect(result).toEqual(
        'Attend 123 Fake Street, Fakestown, LN123TO, as directed, to address your dependency on, or propensity to misuse, a controlled drug.'
      )
    })

    it('Will replace placeholders for conditional reveal inputs', () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: '4673ebe4-9fc0-4e48-87c9-eb17d5280867',
        category:
          'Supervision in the community by the supervising officer, or other responsible officer, or organisation',
        sequence: 1,
        text: 'Report to staff at [NAME OF APPROVED PREMISES] at [TIME / DAILY], unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
        data: [
          { id: 1, field: 'approvedPremises', value: 'the police station', sequence: 0 },
          { id: 2, field: 'reportingTime', value: '2pm', sequence: 1 },
          { id: 3, field: 'reviewPeriod', value: 'Other', sequence: 2 },
          { id: 4, field: 'alternativeReviewPeriod', value: 'Fortnightly', sequence: 3 },
        ],
        uploadSummary: [],
      }
      const result = expandAdditionalCondition(condition.code, condition.data)
      expect(result).toEqual(
        'Report to staff at The Police Station at 2pm, unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on a fortnightly basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.'
      )
    })

    it('Will replace adjust wording where values start with vowel', () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: '4673ebe4-9fc0-4e48-87c9-eb17d5280867',
        category:
          'Supervision in the community by the supervising officer, or other responsible officer, or organisation',
        sequence: 1,
        text: 'Report to staff at [NAME OF APPROVED PREMISES] at [TIME / DAILY], unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
        data: [
          { id: 1, field: 'approvedPremises', value: 'the police station', sequence: 0 },
          { id: 2, field: 'reportingTime', value: '2pm', sequence: 1 },
          { id: 3, field: 'reviewPeriod', value: 'Other', sequence: 2 },
          { id: 4, field: 'alternativeReviewPeriod', value: 'ongoing', sequence: 3 },
        ],
        uploadSummary: [],
      }
      const result = expandAdditionalCondition(condition.code, condition.data)
      expect(result).toEqual(
        'Report to staff at The Police Station at 2pm, unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on an ongoing basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.'
      )
    })
  })
})
