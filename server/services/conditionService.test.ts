import { AdditionalConditionsResponse, Licence } from '../@types/licenceApiClientTypes'
import { AdditionalConditionsConfig } from '../@types/LicencePolicy'
import LicenceApiClient from '../data/licenceApiClient'
import ConditionService from './conditionService'
// eslint-disable-next-line camelcase
import policyV2_0 from '../../integration_tests/mockApis/polices/v2-0'
// eslint-disable-next-line camelcase
import policyV2_1 from '../../integration_tests/mockApis/polices/v2-1'
import NamedIndividuals from '../routes/manageConditions/types/additionalConditionInputs/namedIndividuals'
import DrugTestLocation from '../routes/manageConditions/types/additionalConditionInputs/drugTestLocation'
import LicenceStatus from '../enumeration/licenceStatus'
import { User } from '../@types/CvlUserDetails'

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
        await conditionService.getAdditionalConditionByCode('355700a9-6184-40c0-9759-0dfed1994e1e', version),
      ).toEqual(expectedCondition)
    })
  })

  describe('getAdditionalConditionType', () => {
    const version = '2.0'
    it('returns `AP` for AP conditions', async () => {
      expect(
        await conditionService.getAdditionalConditionType('355700a9-6184-40c0-9759-0dfed1994e1e', version),
      ).toEqual('AP')
    })

    it('returns `PSS` for PSS conditions', async () => {
      expect(
        await conditionService.getAdditionalConditionType('fda24aa9-a2b0-4d49-9c87-23b0a7be4013', version),
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

  describe('Get additional AP Conditions for summary and pdf', () => {
    const parentLicence = {
      id: 2,
      kind: 'VARIATION',
      statusCode: LicenceStatus.VARIATION_APPROVED,
      variationOf: 1,
      createdByFullName: 'James Brown',
      dateLastUpdated: '12/11/2022 10:45:00',
      isInPssPeriod: true,
      additionalLicenceConditions: [{ id: 1, code: 'testCode', uploadSummary: [{ filename: 'testFile' }] }],
    } as Licence

    const user = {
      username: 'joebloggs',
      displayName: 'Joe Bloggs',
      deliusStaffIdentifier: 2000,
      firstName: 'Joe',
      lastName: 'Bloggs',
      emailAddress: 'jbloggs@probation.gov.uk',
    } as User

    const selfLicence = {
      id: 2,
      kind: 'VARIATION',
      statusCode: LicenceStatus.VARIATION_APPROVED,
      variationOf: 1,
      createdByFullName: 'James Brown',
      dateLastUpdated: '12/11/2022 10:45:00',
      isInPssPeriod: true,
      additionalLicenceConditions: [
        { id: 2, code: 'testCode', uploadSummary: [{ filename: 'testFile' }] },
        { id: 3, code: 'testCode', uploadSummary: [{ filename: 'testFile' }] },
      ],
    } as Licence

    it('should return parent additional conditions if licence is in PSS period', async () => {
      licenceApiClient.getParentLicenceOrSelf.mockResolvedValue(parentLicence)
      const conditionsToDisplay = await conditionService.getAdditionalAPConditionsForSummaryAndPdf(selfLicence, user)
      expect(conditionsToDisplay.length).toEqual(parentLicence.additionalLicenceConditions.length)
      expect(conditionsToDisplay[0].id).toEqual(1)
    })

    it('should return self additional conditions if licence is in not in PSS period', async () => {
      selfLicence.isInPssPeriod = false
      const conditionsToDisplay = await conditionService.getAdditionalAPConditionsForSummaryAndPdf(selfLicence, user)
      expect(conditionsToDisplay.length).toEqual(selfLicence.additionalLicenceConditions.length)
      expect(conditionsToDisplay[0].id).toEqual(2)
      expect(conditionsToDisplay[1].id).toEqual(3)
    })
  })
})
