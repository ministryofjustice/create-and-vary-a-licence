import { AdditionalConditionsResponse } from '../@types/licenceApiClientTypes'
import { AdditionalConditionsConfig } from '../@types/LicencePolicy'
import LicenceApiClient from '../data/licenceApiClient'
import ConditionService from './conditionService'
// eslint-disable-next-line camelcase
import policyV2_0 from '../../integration_tests/mockApis/polices/v2-0'
// eslint-disable-next-line camelcase
import policyV2_1 from '../../integration_tests/mockApis/polices/v2-1'
import NamedIndividuals from '../routes/creatingLicences/types/additionalConditionInputs/namedIndividuals'
import DrugTestLocation from '../routes/creatingLicences/types/additionalConditionInputs/drugTestLocation'

jest.mock('../data/licenceApiClient')

describe('ConditionService', () => {
  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
  const conditionService = new ConditionService(licenceApiClient) as jest.Mocked<ConditionService>

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
