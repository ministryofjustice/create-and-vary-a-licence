import { AdditionalCondition, AdditionalConditionsResponse } from '../@types/licenceApiClientTypes'
import { AdditionalConditionsConfig } from '../@types/LicencePolicy'
import LicenceApiClient from '../data/licenceApiClient'
import ConditionFormatter from './conditionFormatter'
import ConditionService from './conditionService'
// eslint-disable-next-line camelcase
import policyV2_0 from '../../integration_tests/mockApis/polices/v2-0'
// eslint-disable-next-line camelcase
import policyV2_1 from '../../integration_tests/mockApis/polices/v2-1'
import NamedIndividuals from '../routes/creatingLicences/types/additionalConditionInputs/namedIndividuals'
import DrugTestLocation from '../routes/creatingLicences/types/additionalConditionInputs/drugTestLocation'

jest.mock('../data/licenceApiClient')

describe('ConditionService', () => {
  const conditionFormatter = new ConditionFormatter()
  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
  const conditionService = new ConditionService(licenceApiClient, conditionFormatter) as jest.Mocked<ConditionService>

  licenceApiClient.getLicencePolicyForVersion.mockResolvedValue(policyV2_0)
  licenceApiClient.getActiveLicencePolicy.mockResolvedValue(policyV2_1)

  describe('getPolicyVersion', () => {
    it('returns the version of the version of the policy config returned by getActiveLicencePolicy on the licenceApiClient', async () => {
      // eslint-disable-next-line camelcase
      expect(await conditionService.getPolicyVersion()).toEqual(policyV2_1.version)
    })
  })

  describe('getAdditionalConditionByCode', () => {
    it('returns the given condition with the validator type', async () => {
      const version = '2.0'
      const expectedCondition = {
        code: '355700a9-6184-40c0-9759-0dfed1994e1e',
        category: 'Making or maintaining contact with a person',
        categoryShort: 'Contact with a person',
        text: 'Not to contact or associate with [NAMED OFFENDER(S) / NAMED INDIVIDUAL(S)] without the prior approval of your supervising officer.',
        tpl: 'Not to contact or associate with {nameOfIndividual} without the prior approval of your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: 'text',
            label: 'Enter name of offender or individual',
            name: 'nameOfIndividual',
            listType: 'OR',
            case: 'capitalised',
            addAnother: {
              label: 'Add another person',
            },
          },
        ],
        type: 'NamedIndividuals',
        validatorType: NamedIndividuals,
      }

      expect(
        await conditionService.getAdditionalConditionByCode('355700a9-6184-40c0-9759-0dfed1994e1e', version)
      ).toEqual(expectedCondition)
    })
  })

  describe('getAdditionalConditionType', () => {
    const version = '2.0'
    it('returns `AP` for AP conditions', async () => {
      expect(
        await conditionService.getAdditionalConditionType('355700a9-6184-40c0-9759-0dfed1994e1e', version)
      ).toEqual('AP')
    })

    it('returns `PSS` for PSS conditions', async () => {
      expect(
        await conditionService.getAdditionalConditionType('fda24aa9-a2b0-4d49-9c87-23b0a7be4013', version)
      ).toEqual('PSS')
    })

    it('returns null if the condition cannot be found', async () => {
      expect(await conditionService.getAdditionalConditionType('abc123', version)).toEqual(null)
    })
  })

  describe('expandAdditionalConditions', () => {
    const version = '2.0'

    it('Will return text verbatim when no placeholders exist', async () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: 'ed607a91-fe3a-4816-8eb9-b447c945935c',
        category: 'Possession, ownership, control or inspection of specified items or documents',
        sequence: 1,
        text: 'Not to own or use a camera without the prior approval of your supervising officer.',
        data: [],
        uploadSummary: [],
      }

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, version)
      expect(result).toEqual('Not to own or use a camera without the prior approval of your supervising officer.')
    })

    it('Will replace single placeholder with a single value', async () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: '5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd',
        category: 'Residence at a specific place',
        sequence: 0,
        text: 'You must reside within the [INSERT REGION] while of no fixed abode, unless otherwise approved by your supervising officer.',
        data: [{ id: 1, field: 'probationRegion', value: 'London', sequence: 0 }],
        uploadSummary: [],
      }

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, version)
      expect(result).toEqual(
        'You must reside within the London probation region while of no fixed abode, unless otherwise approved by your supervising officer.'
      )
    })

    it('Will remove optional placeholders that are not matched by data', async () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: '5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd',
        category: 'Residence at a specific place',
        sequence: 0,
        text: 'You must reside within [INSERT REGION] while of no fixed abode, unless otherwise approved by your supervising officer.',
        data: [{ id: 1, field: 'wrongName', value: 'London', sequence: 0 }],
        uploadSummary: [],
      }

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, version)
      // The two consecutive spaces are expected here
      expect(result).toEqual(
        'You must reside within the  probation region while of no fixed abode, unless otherwise approved by your supervising officer.'
      )
    })

    it('Will replace placeholders of type number', async () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: '9da214a3-c6ae-45e1-a465-12e22adf7c87',
        category: 'Participation in, or co-operation with, a programme or set of activities',
        sequence: 1,
        text: 'Not to undertake work or other organised activity which will involve a person under the age of [INSERT AGE], either on a paid or unpaid basis without the prior approval of your supervising officer.',
        data: [{ id: 1, field: 'age', value: '18', sequence: 0 }],
        uploadSummary: [],
      }

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, version)
      expect(result).toEqual(
        'Not to undertake work or other organised activity which will involve a person under the age of 18, either on a paid or unpaid basis without the prior approval of your supervising officer.'
      )
    })

    it('Will replace multiple placeholders and adjust case to lower', async () => {
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

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, version)
      expect(result).toEqual(
        'Not to reside (not even to stay for one night) in the same household as any child under the age of 18 without the prior approval of your supervising officer.'
      )
    })

    it('Will replace placeholders for a list with and "and" between them and include optional text for optional values', async () => {
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

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, version)
      expect(result).toEqual(
        'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol and drug problems at the Walthamstow Rehabilitation Clinic.'
      )
    })

    it('Will omit optional text from the sentence when an optional value is not supplied', async () => {
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

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, version)
      expect(result).toEqual(
        'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol and drug problems.'
      )
    })

    it('Will make sense with multiple optional values - none supplied', async () => {
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

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, version)
      expect(result).toEqual(
        'Attend Harlow Clinic, High Street, London, W1 3GV, as directed, to address your dependency on, or propensity to misuse, a controlled drug.'
      )
    })

    it('Will make sense with multiple optional values - one supplied', async () => {
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

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, version)
      expect(result).toEqual(
        'Attend Harlow Clinic, High Street, London, W1 3GV on 12th February 2022, as directed, to address your dependency on, or propensity to misuse, a controlled drug.'
      )
    })

    it('Will make sense with multiple optional values - two supplied', async () => {
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

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, version)
      expect(result).toEqual(
        'Attend Harlow Clinic, High Street, London, W1 3GV on 12th February 2022 at 11:15 am, as directed, to address your dependency on, or propensity to misuse, a controlled drug.'
      )
    })

    it('Will replace placeholders for a list of values with commas and "and" between (list type AND)', async () => {
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

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, version)
      expect(result).toEqual(
        'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol, drug, sexual, violent, gambling and anger problems at the AA meeting.'
      )
    })

    it('Will replace placeholders for a list of 2 values with an "OR" between them (list type OR)', async () => {
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

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, version)
      expect(result).toEqual(
        'Not to seek to approach or communicate with Jane Doe or John Doe without the prior approval of your supervising officer and / or East Hull Social Services.'
      )
    })

    it('Will replace placeholders for a list of values with commas and an "OR" between them (list type OR)', async () => {
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

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, version)
      expect(result).toEqual(
        'Not to seek to approach or communicate with Jane Doe, John Doe or Jack Dont without the prior approval of your supervising officer and / or East Hull Social Services.'
      )
    })

    it('Will correctly format an address', async () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: 'a7c57e4e-30fe-4797-9fe7-70a35dbd7b65',
        category: 'Residence at a specific place',
        sequence: 1,
        text: 'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
        data: [{ id: 1, field: 'appointmentAddress', value: '123 Fake Street, , Fakestown, , LN123TO', sequence: 0 }],
        uploadSummary: [],
      }

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, version)
      expect(result).toEqual(
        'Attend 123 Fake Street, Fakestown, LN123TO, as directed, to address your dependency on, or propensity to misuse, a controlled drug.'
      )
    })

    it('Will replace placeholders for conditional reveal inputs', async () => {
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

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, version)
      expect(result).toEqual(
        'Report to staff at The Police Station at 2pm, unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on a fortnightly basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.'
      )
    })

    it('Will replace adjust wording where values start with vowel', async () => {
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

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, version)
      expect(result).toEqual(
        'Report to staff at The Police Station at 2pm, unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on an ongoing basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.'
      )
    })
  })

  describe('parseResponse', () => {
    it('Adds the validatorType to additional conditions', () => {
      const conditionConfig = {
        AP: [
          {
            code: '355700a9-6184-40c0-9759-0dfed1994e1e',
            category: 'Making or maintaining contact with a person',
            categoryShort: 'Contact with a person',
            text: 'Not to contact or associate with [NAMED OFFENDER(S) / NAMED INDIVIDUAL(S)] without the prior approval of your supervising officer.',
            tpl: 'Not to contact or associate with {nameOfIndividual} without the prior approval of your supervising officer.',
            requiresInput: true,
            inputs: [
              {
                type: 'text',
                label: 'Enter name of offender or individual',
                name: 'nameOfIndividual',
                listType: 'OR',
                case: 'capitalised',
                addAnother: {
                  label: 'Add another person',
                },
              },
            ],
            type: 'NamedIndividuals',
          },
        ],
        PSS: [
          {
            code: 'fda24aa9-a2b0-4d49-9c87-23b0a7be4013',
            category: 'Drug testing',
            text: 'Attend [INSERT NAME AND ADDRESS], as reasonably required by your supervisor, to give a sample of oral fluid / urine in order to test whether you have any specified Class A or specified Class B drugs in your body, for the purpose of ensuring that you are complying with the requirement of your supervision period requiring you to be of good behaviour.',
            tpl: 'Attend {name} {address}, as reasonably required by your supervisor, to give a sample of oral fluid / urine in order to test whether you have any specified Class A or specified Class B drugs in your body, for the purpose of ensuring that you are complying with the requirement of your supervision period requiring you to be of good behaviour.',
            requiresInput: true,
            inputs: [
              {
                type: 'text',
                label: 'Enter name',
                name: 'name',
              },
              {
                type: 'address',
                label: 'Enter address',
                name: 'address',
              },
            ],
            type: 'DrugTestLocation',
          },
        ],
      } as AdditionalConditionsResponse
      const expectedOutput = {
        AP: [
          {
            code: '355700a9-6184-40c0-9759-0dfed1994e1e',
            category: 'Making or maintaining contact with a person',
            categoryShort: 'Contact with a person',
            text: 'Not to contact or associate with [NAMED OFFENDER(S) / NAMED INDIVIDUAL(S)] without the prior approval of your supervising officer.',
            tpl: 'Not to contact or associate with {nameOfIndividual} without the prior approval of your supervising officer.',
            requiresInput: true,
            inputs: [
              {
                type: 'text',
                label: 'Enter name of offender or individual',
                name: 'nameOfIndividual',
                listType: 'OR',
                case: 'capitalised',
                addAnother: {
                  label: 'Add another person',
                },
              },
            ],
            type: 'NamedIndividuals',
            validatorType: NamedIndividuals,
          },
        ],
        PSS: [
          {
            code: 'fda24aa9-a2b0-4d49-9c87-23b0a7be4013',
            category: 'Drug testing',
            text: 'Attend [INSERT NAME AND ADDRESS], as reasonably required by your supervisor, to give a sample of oral fluid / urine in order to test whether you have any specified Class A or specified Class B drugs in your body, for the purpose of ensuring that you are complying with the requirement of your supervision period requiring you to be of good behaviour.',
            tpl: 'Attend {name} {address}, as reasonably required by your supervisor, to give a sample of oral fluid / urine in order to test whether you have any specified Class A or specified Class B drugs in your body, for the purpose of ensuring that you are complying with the requirement of your supervision period requiring you to be of good behaviour.',
            requiresInput: true,
            inputs: [
              {
                type: 'text',
                label: 'Enter name',
                name: 'name',
              },
              {
                type: 'address',
                label: 'Enter address',
                name: 'address',
              },
            ],
            type: 'DrugTestLocation',
            validatorType: DrugTestLocation,
          },
        ],
      } as AdditionalConditionsConfig

      expect(conditionService.parseResponse(conditionConfig)).toEqual(expectedOutput)
    })
  })
})
