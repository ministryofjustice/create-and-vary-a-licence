import { SuperAgentRequest } from 'superagent'
import { addDays, addMonths, format, subDays } from 'date-fns'
import { stubFor } from '../wiremock'
import LicenceStatus from '../../server/licences/licenceStatus'
// eslint-disable-next-line camelcase
import policyV2_0 from './polices/v2-0'
// eslint-disable-next-line camelcase
import policyV2_1 from './polices/v2-1'
// eslint-disable-next-line camelcase
import policyV3_0 from './polices/v3-0'
import LicenceCreationType from '../../server/enumeration/licenceCreationType'
import {
  AdditionalCondition,
  ElectronicMonitoringProvider,
  Licence,
  LicencePolicyResponse,
} from '../../server/@types/licenceApiClientTypes'
import LicenceKind from '../../server/enumeration/LicenceKind'

const ACTIVE_POLICY_VERSION = '3.0'

const licencePlaceholder: Licence = {
  isDueForEarlyRelease: false,
  isDueToBeReleasedInTheNextTwoWorkingDays: false,
  isEligibleForEarlyRelease: false,
  isInHardStopPeriod: false,
  isReviewNeeded: false,
  isVariation: false,
  id: 1,
  typeCode: 'AP_PSS',
  kind: 'CRD',
  version: ACTIVE_POLICY_VERSION,
  statusCode: 'IN_PROGRESS',
  nomsId: 'G9786GC',
  bookingNo: '123456',
  bookingId: 54321,
  crn: 'X12345',
  pnc: '2019/123445',
  cro: '12345',
  prisonCode: 'LEI',
  prisonDescription: 'Leeds (HMP)',
  forename: 'Test',
  surname: 'Person',
  dateOfBirth: '12/02/1980',
  appointmentPerson: 'Duty Officer',
  conditionalReleaseDate: '13/03/2021',
  actualReleaseDate: '01/04/2021',
  earliestReleaseDate: '01/04/2021',
  sentenceStartDate: '10/01/2019',
  sentenceEndDate: '26/04/2022',
  licenceStartDate: '01/04/2021',
  licenceExpiryDate: '26/04/2060',
  topupSupervisionStartDate: '26/04/2022',
  topupSupervisionExpiryDate: '26/06/2060',
  hardStopDate: '29/04/2021',
  hardStopWarningDate: '29/04/2021',
  comUsername: 'jsmith',
  comStaffId: 12345,
  comEmail: 'john.smith@nps.gov.uk',
  probationAreaCode: 'N01',
  probationAreaDescription: 'Wales',
  probationPduCode: 'PDU1',
  probationPduDescription: 'Cardiff',
  probationLauCode: 'LAU1',
  probationLauDescription: 'Cardiff South',
  probationTeamCode: 'A',
  probationTeamDescription: 'Cardiff South Team A',
  dateCreated: '10/09/2021 10:00', // Make dynamic to now?
  dateLastUpdated: '10/09/2021 10:01:00', // Make dynamic to now?
  createdByUsername: 'X12345',
  createdByFullName: 'John Smith',
  licenceAppointmentAddress: {
    reference: '1234',
    uprn: '10000000001',
    firstLine: '123 Fake Street',
    secondLine: '',
    townOrCity: 'Faketown',
    county: 'Fakeshire',
    postcode: 'FA11KE',
    source: 'MANUAL',
  },
  standardLicenceConditions: [
    { id: 1, code: 'goodBehaviour', sequence: 1, text: 'Be of good behaviour' },
    { id: 2, code: 'notBreakLaw', sequence: 2, text: 'Do not break the law' },
    { id: 3, code: 'attendMeetings', sequence: 3, text: 'Attend arranged meetings' },
  ],
  standardPssConditions: [
    { id: 1, code: 'goodBehaviour', sequence: 1, text: 'Be of good behaviour' },
    { id: 2, code: 'notBreakLaw', sequence: 2, text: 'Do not break the law' },
    { id: 3, code: 'attendMeetings', sequence: 3, text: 'Attend arranged meetings' },
  ],
  additionalLicenceConditions: [
    {
      id: 1,
      code: '5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd',
      category: 'Residence at a specific place',
      sequence: 0,
      text: 'You must reside overnight within [REGION] probation region while of no fixed abode, unless otherwise approved by your supervising officer.',
      expandedText:
        'You must reside overnight within London while of no fixed abode, unless otherwise approved by your supervising officer.',
      data: [
        {
          id: 1,
          sequence: 0,
          field: 'probationRegion',
          value: 'London',
          contributesToLicence: true,
        },
      ],
      uploadSummary: [],
      readyToSubmit: true,
    },
    {
      id: 2,
      code: '4673ebe4-9fc0-4e48-87c9-eb17d5280867',
      category: 'Supervision in the community',
      sequence: 1,
      text: 'Report to staff at [NAME OF APPROVED PREMISES] at [TIME / DAILY], unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
      expandedText:
        'Report to staff at The Approved Premises at 9:30AM Daily, unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on a Monthly basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
      data: [
        {
          id: 1,
          sequence: 0,
          field: 'approvedPremises',
          value: 'The Approved Premises',
          contributesToLicence: true,
        },
      ],
      uploadSummary: [],
      readyToSubmit: true,
    },
  ],
  bespokeConditions: [],
  additionalPssConditions: [],
}

export const licenceConditions: AdditionalCondition[] = [
  {
    id: 1,
    code: '5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd',
    category: 'Residence at a specific place',
    sequence: 0,
    text: 'You must reside within [INSERT REGION] while of no fixed abode, unless otherwise approved by your supervising officer.',
    expandedText:
      'You must reside within London while of no fixed abode, unless otherwise approved by your supervising officer.',
    data: [
      {
        id: 1,
        sequence: 0,
        field: 'probationRegion',
        value: 'London',
        contributesToLicence: false,
      },
    ],
    requiresInput: true,
    uploadSummary: [],
    readyToSubmit: true,
  },
  {
    id: 2,
    code: 'fce34fb2-02f4-4eb0-9b8d-d091e11451fa',
    category: 'Restriction of residency',
    sequence: 1,
    text: 'Not to reside (not even to stay for one night) in the same household as [ANY / ANY FEMALE / ANY MALE] child under the age of [INSERT AGE] without the prior approval of your supervising officer.',
    data: [
      {
        id: 2,
        sequence: 0,
        field: 'gender',
        value: 'Any',
        contributesToLicence: false,
      },
      {
        id: 3,
        sequence: 0,
        field: 'age',
        value: '16',
        contributesToLicence: false,
      },
    ],
    requiresInput: true,
    uploadSummary: [],
    readyToSubmit: true,
  },
  {
    id: 3,
    code: '89e656ec-77e8-4832-acc4-6ec05d3e9a98',
    category: 'Programmes or activities',
    sequence: 2,
    text: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your [ALCOHOL / DRUG / SEXUAL / VIOLENT / GAMBLING / SOLVENT ABUSE / ANGER / DEBT / PROLIFIC / OFFENDING BEHAVIOUR] problems.',
    data: [
      {
        id: 4,
        sequence: 0,
        field: 'behaviourProblems',
        value: 'gambling',
        contributesToLicence: false,
      },
      {
        id: 5,
        sequence: 1,
        field: 'behaviourProblems',
        value: 'debt',
        contributesToLicence: false,
      },
    ],
    requiresInput: true,
    uploadSummary: [],
    readyToSubmit: true,
  },
  {
    id: 4,
    code: '0a370862-5426-49c1-b6d4-3d074d78a81a',
    category: 'Programmes or activities',
    sequence: 3,
    text: 'Confine yourself to an address approved by your supervising officer between the hours of [TIME] and [TIME] daily unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk that you present has reduced appropriately.',
    data: [
      {
        id: 6,
        sequence: 0,
        field: 'numberOfCurfews',
        value: 'One curfew',
        contributesToLicence: false,
      },
      {
        id: 7,
        sequence: 1,
        field: 'curfewStart',
        value: '7:30pm',
        contributesToLicence: false,
      },
      {
        id: 8,
        sequence: 2,
        field: 'curfewEnd',
        value: '7:30am',
        contributesToLicence: false,
      },
      {
        id: 9,
        sequence: 3,
        field: 'reviewPeriod',
        value: 'Other',
        contributesToLicence: false,
      },
      {
        id: 10,
        sequence: 4,
        field: 'alternativeReviewPeriod',
        value: 'Annually',
        contributesToLicence: false,
      },
    ],
    requiresInput: true,
    uploadSummary: [],
    readyToSubmit: true,
  },
  {
    id: 5,
    code: '3932e5c9-4d21-4251-a747-ce6dc52dc9c0',
    category: 'Items and documents',
    sequence: 4,
    text: 'Not to own or possess a [SPECIFIED ITEM] without the prior approval of your supervising officer.',
    data: [
      {
        id: 11,
        sequence: 0,
        field: 'item',
        value: 'Knives',
        contributesToLicence: false,
      },
      {
        id: 12,
        sequence: 1,
        field: 'item',
        value: 'Needles',
        contributesToLicence: false,
      },
    ],
    requiresInput: true,
    uploadSummary: [],
    readyToSubmit: true,
  },
  {
    id: 6,
    code: '9ae2a336-3491-4667-aaed-dd852b09b4b9',
    category: 'Making or maintaining contact with a person',
    sequence: 5,
    text: 'Receive home visits from a Mental Health Worker.',
    data: [],
    requiresInput: true,
    uploadSummary: [],
    readyToSubmit: true,
  },
]

const nextMonth = format(addMonths(new Date(), 1), 'yyyy-MM-dd')
const nextThirtyDays = format(addDays(new Date(), 30), 'yyyy-MM-dd')
const probationPractitionerPlaceholder = {
  staffCode: 'X1234',
  name: 'Joe Bloggs',
}

export default {
  updateComDetails: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licences-api/com/update`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    })
  },

  stubUpdatePrisonUserDetails: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licences-api/prison-user/update`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    })
  },

  stubUpdateResponsibleCom: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licences-api/offender/crn/.*/responsible-com`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    })
  },

  stubUpdateProbationTeam: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licences-api/offender/crn/.*/probation-team`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    })
  },

  stubGetLicence: (options: {
    licenceKind?: LicenceKind
    electronicMonitoringProviderStatus?: 'NOT_NEEDED' | 'NOT_STARTED' | 'COMPLETE'
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/licence/id/(\\d)*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...licencePlaceholder,
          licenceKind: options.licenceKind || LicenceKind.CRD,
          electronicMonitoringProviderStatus: options.electronicMonitoringProviderStatus || 'NOT_NEEDED',
        },
      },
    })
  },

  stubGetHdcLicence: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/licence/id/(\\d)*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...licencePlaceholder,
          kind: 'HDC',
          homeDetentionCurfewActualDate: '01/03/2021',
        },
      },
    })
  },

  stubPutLicenceAppointmentPerson: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licences-api/licence/id/(\\d)*/appointment/address`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubSearchForAddresses: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/address/search/by/text/.*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            uprn: '10000000001',
            firstLine: '123 Fake Street',
            secondLine: '',
            townOrCity: 'Faketown',
            county: 'Fakeshire',
            postcode: 'FA11KE',
            source: 'OS_PLACES',
          },
          {
            uprn: '10000000002',
            firstLine: '456 Another Street',
            secondLine: '',
            townOrCity: 'Anothertown',
            county: 'Anothershire',
            postcode: 'AN11TH',
            source: 'OS_PLACES',
          },
        ],
      },
    })
  },

  stubGetStaffPreferredAddresses: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/staff/address/preferred`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            reference: '550e8400-e29b-41d4-a716-446655440000',
            uprn: '10000000001',
            firstLine: '123 Fake Street',
            secondLine: '',
            townOrCity: 'Faketown',
            county: 'Fakeshire',
            postcode: 'FA11KE',
            source: 'OS_PLACES',
          },
          {
            reference: '550e8400-e29b-41d4-a716-446655440001',
            uprn: '10000000002',
            firstLine: '456 Another Street',
            secondLine: '',
            townOrCity: 'Anothertown',
            county: 'Anothershire',
            postcode: 'AN11TH',
            source: 'OS_PLACES',
          },
        ],
      },
    })
  },

  stubGetStaffNoPreferredAddresses: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/staff/address/preferred`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [],
      },
    })
  },

  stubGetHdcLicenceData: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/hdc/curfew/licenceId/(\\d)*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          licenceId: 1,
          curfewAddress: {
            addressLine1: '1 The Street',
            addressLine2: 'Avenue',
            townOrCity: 'Some Town',
            county: 'Some County',
            postcode: 'A1 2BC',
          },
          firstNightCurfewHours: {
            firstNightFrom: '17:00',
            firstNightUntil: '07:00',
          },
          curfewTimes: [
            {
              id: 1,
              curfewTimesSequence: 1,
              fromDay: 'MONDAY',
              fromTime: '17:00',
              untilDay: 'TUESDAY',
              untilTime: '07:00',
            },
            {
              id: 1,
              curfewTimesSequence: 2,
              fromDay: 'TUESDAY',
              fromTime: '17:00',
              untilDay: 'WEDNESDAY',
              untilTime: '07:00',
            },
            {
              id: 1,
              curfewTimesSequence: 3,
              fromDay: 'WEDNESDAY',
              fromTime: '17:00',
              untilDay: 'THURSDAY',
              untilTime: '07:00',
            },
            {
              id: 1,
              curfewTimesSequence: 4,
              fromDay: 'THURSDAY',
              fromTime: '17:00',
              untilDay: 'FRIDAY',
              untilTime: '07:00',
            },
            {
              id: 1,
              curfewTimesSequence: 5,
              fromDay: 'FRIDAY',
              fromTime: '17:00',
              untilDay: 'SATURDAY',
              untilTime: '07:00',
            },
            {
              id: 1,
              curfewTimesSequence: 6,
              fromDay: 'SATURDAY',
              fromTime: '17:00',
              untilDay: 'SUNDAY',
              untilTime: '07:00',
            },
            {
              id: 1,
              curfewTimesSequence: 7,
              fromDay: 'SUNDAY',
              fromTime: '17:00',
              untilDay: 'MONDAY',
              untilTime: '07:00',
            },
          ],
        },
      },
    })
  },

  stubGetEmptyLicence: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/licence/id/(\\d)*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...licencePlaceholder,
          additionalLicenceConditions: [],
        },
      },
    })
  },

  stubGetPssLicence: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/licence/id/(\\d)*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { ...licencePlaceholder, typeCode: 'PSS' },
      },
    })
  },

  stubGetPolicyChanges: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/licence-policy/compare/(\\d.\\d)/licence/((\\d))`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            changeType: 'NEW_OPTIONS',
            code: '4673ebe4-9fc0-4e48-87c9-eb17d5280867',
            sequence: 1,
            previousText:
              'Report to staff at [NAME OF APPROVED PREMISES] at [TIME / DAILY], unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
            dataChanges: [],
            suggestions: [],
          },
          {
            changeType: 'TEXT_CHANGE',
            code: '5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd',
            sequence: 2,
            previousText:
              'You must reside within the [INSERT REGION] while of no fixed abode, unless otherwise approved by your supervising officer.',
            currentText:
              'You must reside overnight within [REGION] probation region while of no fixed abode, unless otherwise approved by your supervising officer.',
            dataChanges: [],
            suggestions: [],
          },
          {
            changeType: 'REPLACED',
            code: 'c2435d4a-20a0-47de-b080-e1e740d1514c',
            sequence: 3,
            previousText:
              'Confine yourself to remain at [CURFEW ADDRESS] initially from [START OF CURFEW HOURS] until [END OF CURFEW HOURS] each day, and, thereafter, for such a period as may be reasonably notified to you by your supervising officer; and comply with such arrangements as may be reasonably put in place and notified to you by your supervising officer so as to allow for your whereabouts and your compliance with your curfew requirement be monitored (whether by electronic means involving your wearing an electronic tag or otherwise).',
            dataChanges: [],
            suggestions: [
              {
                code: '0a370862-5426-49c1-b6d4-3d074d78a81a',
                currentText:
                  'Confine yourself to an address approved by your supervising officer between the hours of [TIME] and [TIME] daily unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk that you present has reduced appropriately.',
              },
              {
                code: 'fd129172-bdd3-4d97-a4a0-efd7b47a49d4',
                currentText:
                  'Allow person(s) as designated by your supervising officer to install an electronic monitoring tag on you and access to install any associated equipment in your property, and for the purpose of ensuring that equipment is functioning correctly. You must not damage or tamper with these devices and ensure that the tag is charged, and report to your supervising officer and the EM provider immediately if the tag or the associated equipment are not working correctly. This will be for the purpose of monitoring your [INSERT TYPES OF CONDITIONS TO BE ELECTRONICALLY MONITORED HERE] licence condition(s) unless otherwise authorised by your supervising officer.',
              },
            ],
          },
          {
            changeType: 'DELETED',
            code: '599bdcae-d545-461c-b1a9-02cb3d4ba268',
            sequence: 4,
            previousText:
              'You are subject to alcohol monitoring. Your alcohol intake will be electronically monitored for a period of [INSERT TIMEFRAME] ending on [END DATE], and you may not consume units of alcohol, unless otherwise permitted by your supervising officer.',
            dataChanges: [],
            suggestions: [
              {
                code: 'd36a3b77-30ba-40ce-8953-83e761d3b487',
                currentText:
                  'You must not drink any alcohol until [END DATE] unless your probation officer says you can. You will need to wear an electronic tag all the time so we can check this.',
              },
              {
                code: '2F8A5418-C6E4-4F32-9E58-64B23550E504',
                currentText:
                  'You will need to wear an electronic tag all the time until [END DATE] so we can check how much alcohol you are drinking, and if you are drinking alcohol when you have been told you must not. To help you drink less alcohol you must take part in any activities, like treatment programmes, your probation officer asks you to.',
              },
            ],
          },
        ],
      },
    })
  },
  stubGetCompletedLicence: (options: {
    statusCode: string
    typeCode: 'AP_PSS' | 'AP' | 'PSS'
    appointmentTimeType?: 'IMMEDIATE_UPON_RELEASE' | 'NEXT_WORKING_DAY_2PM' | 'SPECIFIC_DATE_TIME'
    isInHardStopPeriod: boolean
    homeDetentionCurfewActualDate: string | null
    homeDetentionCurfewEndDate: string | null
    kind: 'CRD' | 'VARIATION' | 'HARD_STOP' | 'HDC'
    conditions: AdditionalCondition[]
    electronicMonitoringProvider?: ElectronicMonitoringProvider
    electronicMonitoringProviderStatus?: 'NOT_NEEDED' | 'NOT_STARTED' | 'COMPLETE'
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/licence/id/(\\d)*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...licencePlaceholder,
          kind: options.kind,
          statusCode: options.statusCode, // Overrides licencePlaceHolder status
          typeCode: options.typeCode, // Overrides licence status code
          appointmentPersonType: 'SPECIFIC_PERSON',
          appointmentPerson: 'Duty Officer',
          appointmentAddress: 'Some address, Some town',
          appointmentTelephoneNumber: '00000000000',
          appointmentAlternativeTelephoneNumber: '1234567890',
          appointmentTime: '01/12/2021 12:34',
          appointmentTimeType: options.appointmentTimeType || 'SPECIFIC_DATE_TIME',
          isInHardStopPeriod: options.isInHardStopPeriod || false,
          hardStopDate: options.isInHardStopPeriod
            ? format(subDays(new Date(), 1), 'dd/MM/yyyy')
            : format(addDays(new Date(), 1), 'dd/MM/yyyy'),
          homeDetentionCurfewActualDate: options.homeDetentionCurfewActualDate,
          homeDetentionCurfewEndDate: options.homeDetentionCurfewEndDate,
          additionalLicenceConditions: options.conditions || licenceConditions,
          bespokeConditions: [
            {
              id: 133,
              sequence: 0,
              text: 'Bespoke condition 1',
            },
            {
              id: 134,
              sequence: 1,
              text: 'Bespoke condition 2',
            },
          ],
          additionalPssConditions: [
            {
              id: 1,
              code: '62c83b80-2223-4562-a195-0670f4072088',
              category: 'Drug appointment',
              sequence: 0,
              text: 'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
              expandedText:
                'Attend 123 Fake Street, Fakestown, Fakeshire, FA1 1KE, as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
              data: [
                {
                  id: 1,
                  sequence: 0,
                  field: 'appointmentAddress',
                  value: '123 Fake Street, , Fakestown, Fakeshire, FA1 1KE',
                },
              ],
              readyToSubmit: true,
            },
            {
              id: 2,
              code: 'fda24aa9-a2b0-4d49-9c87-23b0a7be4013',
              category: 'Drug testing',
              sequence: 1,
              text: 'Attend [INSERT NAME AND ADDRESS], as reasonably required by your supervisor, to give a sample of oral fluid / urine in order to test whether you have any specified Class A or specified Class B drugs in your body, for the purpose of ensuring that you are complying with the requirement of your supervision period requiring you to be of good behaviour.',
              data: [
                {
                  id: 1,
                  sequence: 0,
                  field: 'address',
                  value: '123 Fake Street, , Fakestown, Fakeshire, FA1 1KE',
                },
              ],
              readyToSubmit: true,
            },
          ],
          electronicMonitoringProvider: options.electronicMonitoringProvider,
          electronicMonitoringProviderStatus: options.electronicMonitoringProviderStatus || 'NOT_NEEDED',
        },
      },
    })
  },

  stubPostLicence: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: '/licences-api/licence/create',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          licenceId: 1,
          licenceType: 'AP',
          licenceStatus: 'IN_PROGRESS',
        },
      },
    })
  },

  stubGetActiveAndVariationLicencesForOffender: (options: {
    nomisId: string
    status: string
    bookingId: number
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/licences-api/licence/match`,
        bodyPatterns: [
          {
            matchesJsonPath: {
              expression: '$.status',
              or: [
                {
                  contains: 'ACTIVE',
                },
                {
                  contains: 'VARIATION_IN_PROGRESS',
                },
                {
                  contains: 'VARIATION_IN_SUBMITTED',
                },
                {
                  contains: 'VARIATION_IN_REJECTED',
                },
                {
                  contains: 'VARIATION_IN_APPROVED',
                },
              ],
            },
          },
        ],
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: options
          ? [
              {
                licenceId: 1,
                nomisId: options.nomisId,
                licenceStatus: options.status,
                forename: 'Test',
                surname: 'Person',
                crn: 'X12345',
                licenceType: 'AP',
                actualReleaseDate: '23/03/2022',
                comUsername: 'jsmith',
                bookingId: options.bookingId,
                licenceStartDate: '13/04/2023',
                dateCreated: '01/03/2021 10:15',
                hardStopDate: '05/12/2023',
                hardStopWarningDate: '03/12/2023',
              },
            ]
          : [],
      },
    })
  },

  stubGetLicencesForOffender: (options: {
    kind: 'CRD' | 'VARIATION' | 'HARD_STOP' | 'HDC'
    nomisId: string
    status: string
    bookingId: number
    isInHardStopPeriod: boolean
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/licences-api/licence/match`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            kind: options.kind || 'CRD',
            licenceId: 1,
            nomisId: options.nomisId,
            licenceStatus: options.status,
            forename: 'Test',
            surname: 'Person',
            crn: 'X12345',
            licenceType: 'AP',
            actualReleaseDate: '23/03/2022',
            comUsername: 'jsmith',
            bookingId: options.bookingId,
            dateCreated: '01/03/2021 10:15',
            hardStopDate: options.isInHardStopPeriod
              ? format(subDays(new Date(), 1), 'dd/MM/yyyy')
              : format(addDays(new Date(), 1), 'dd/MM/yyyy'),
            hardStopWarningDate: '03/12/2023',
          },
        ],
      },
    })
  },

  stubGetPssLicencesForOffender: (options: {
    kind: 'CRD' | 'VARIATION' | 'HARD_STOP'
    nomisId: string
    status: string
    bookingId: number
    isInHardStopPeriod: boolean
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/licences-api/licence/match`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            kind: options.kind || 'CRD',
            licenceId: 1,
            nomisId: options.nomisId,
            licenceStatus: options.status,
            forename: 'Test',
            surname: 'Person',
            crn: 'X12345',
            licenceType: 'PSS',
            actualReleaseDate: '23/03/2022',
            comUsername: 'jsmith',
            bookingId: options.bookingId,
            dateCreated: '01/03/2021 10:15',
            hardStopDate: options.isInHardStopPeriod
              ? format(subDays(new Date(), 1), 'dd/MM/yyyy')
              : format(addDays(new Date(), 1), 'dd/MM/yyyy'),
            hardStopWarningDate: '03/12/2023',
          },
        ],
      },
    })
  },

  stubPutAppointmentPerson: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licences-api/licence/id/(\\d)*/appointmentPerson`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubPutAppointmentTime: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licences-api/licence/id/(\\d)*/appointmentTime`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubPutAppointmentAddress: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licences-api/licence/id/(\\d)*/appointment-address`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubPutContactNumber: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licences-api/licence/id/(\\d)*/contact-number`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubPutBespokeConditions: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licences-api/licence/id/(\\d)*/bespoke-conditions`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubPutAdditionalConditions: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licences-api/licence/id/(\\d)*/additional-conditions`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubGetLicenceWithConditionToComplete: (options: { code: string; licenceKind?: LicenceKind }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/licence/id/(\\d)*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...licencePlaceholder,
          kind: options.licenceKind || LicenceKind.CRD,
          additionalLicenceConditions: [
            {
              id: 1,
              code: options.code,
              data: [],
            },
          ],
        },
      },
    })
  },

  stubGetLicenceWithPssConditionToComplete: (code: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/licence/id/(\\d)*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...licencePlaceholder,
          additionalPssConditions: [
            {
              id: 1,
              code,
              data: [],
            },
          ],
        },
      },
    })
  },

  stubPutAdditionalConditionData: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licences-api/licence/id/(\\d)*/additional-conditions/condition/(\\d)*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubGetHardStopAndTimedOutLicences: (hardStopLicenceStatus: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/licences-api/licence/match`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            licenceId: 1,
            licenceStatus: 'TIMED_OUT',
            nomisId: licencePlaceholder.nomsId,
            surname: licencePlaceholder.surname,
            forename: licencePlaceholder.forename,
            prisonCode: licencePlaceholder.prisonCode,
            prisonDescription: licencePlaceholder.prisonDescription,
            conditionalReleaseDate: licencePlaceholder.conditionalReleaseDate,
            actualReleaseDate: licencePlaceholder.actualReleaseDate,
            crn: licencePlaceholder.crn,
            dateOfBirth: licencePlaceholder.dateOfBirth,
            comUsername: licencePlaceholder.comUsername,
            kind: 'CRD',
            hardStopDate: '05/12/2023',
            hardStopWarningDate: '03/12/2023',
          },
          {
            licenceId: 2,
            licenceStatus: hardStopLicenceStatus,
            nomisId: licencePlaceholder.nomsId,
            surname: licencePlaceholder.surname,
            forename: licencePlaceholder.forename,
            prisonCode: licencePlaceholder.prisonCode,
            prisonDescription: licencePlaceholder.prisonDescription,
            conditionalReleaseDate: licencePlaceholder.conditionalReleaseDate,
            actualReleaseDate: licencePlaceholder.actualReleaseDate,
            crn: licencePlaceholder.crn,
            dateOfBirth: licencePlaceholder.dateOfBirth,
            comUsername: licencePlaceholder.comUsername,
            kind: 'HARD_STOP',
            hardStopDate: '05/12/2023',
            hardStopWarningDate: '03/12/2023',
          },
        ],
      },
    })
  },

  stubGetPreviouslyApprovedAndTimedOutLicencesCaseload: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/licences-api/caseload/com/staff/(\\d)*/create-case-load`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            name: 'Test Person',
            crnNumber: 'X12345',
            prisonerNumber: 'G9786GC',
            releaseDate: '13/03/2021',
            licenceId: 1,
            licenceStatus: 'TIMED_OUT',
            licenceType: 'AP_PSS',
            probationPractitioner: { staffCode: 'X12345', name: 'John Smith' },
            hardStopDate: '05/12/2023',
            hardStopWarningDate: '03/12/2023',
            licenceCreationType: LicenceCreationType.LICENCE_CHANGES_NOT_APPROVED_IN_TIME,
            isInHardStopPeriod: true,
          },
        ],
      },
    })
  },
  stubGetHardStopAndTimedOutLicencesCaseload: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/licences-api/caseload/com/staff/(\\d)*/create-case-load`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            name: 'Test Person',
            crnNumber: 'X12345',
            prisonerNumber: 'G9786GC',
            releaseDate: '01/04/2021',
            licenceId: 1,
            licenceStatus: 'TIMED_OUT',
            licenceType: 'AP_PSS',
            probationPractitioner: { staffCode: 'X12345', name: 'John Smith' },
            hardStopDate: '05/12/2023',
            hardStopWarningDate: '03/12/2023',
            licenceCreationType: LicenceCreationType.PRISON_WILL_CREATE_THIS_LICENCE,
            isInHardStopPeriod: true,
          },
        ],
      },
    })
  },
  stubGetHardStopAndTimedOutAndSubmittedLicencesCaseload: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/licences-api/caseload/com/staff/(\\d)*/create-case-load`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            name: 'Test Person',
            crnNumber: 'X12345',
            prisonerNumber: 'G9786GC',
            releaseDate: '01/04/2021',
            licenceId: 2,
            licenceStatus: 'TIMED_OUT',
            licenceType: 'AP_PSS',
            probationPractitioner: { staffCode: 'X12345', name: 'John Smith' },
            hardStopDate: '05/12/2023',
            hardStopWarningDate: '03/12/2023',
            licenceCreationType: LicenceCreationType.LICENCE_CREATED_BY_PRISON,
            isInHardStopPeriod: true,
          },
        ],
      },
    })
  },
  stubSubmitStatus: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licences-api/licence/id/(\\d*)/submit`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubUpdateLicenceStatus: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licences-api/licence/id/(\\d*)/status`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubRecordAuditEvent: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licences-api/audit/save`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubCreateVariation: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/licences-api/licence/id/(\\d*)/create-variation`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          licenceId: 2,
        },
      },
    })
  },

  stubUpdateSpoDiscussion: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licences-api/licence/id/(\\d*)/spo-discussion`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubUpdateVloDiscussion: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licences-api/licence/id/(\\d*)/vlo-discussion`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubUpdateReasonForVariation: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licences-api/licence/id/(\\d*)/reason-for-variation`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubGetLicenceVariationInProgress: (licenceVersion = ACTIVE_POLICY_VERSION): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/licence/id/(\\d*)`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...licencePlaceholder,
          id: 2,
          kind: 'VARIATION',
          version: licenceVersion,
          variationOf: 1,
          statusCode: 'VARIATION_IN_PROGRESS',
          spoDiscussion: 'Yes',
          vloDiscussion: 'Yes',
          appointmentPersonType: 'SPECIFIC_PERSON',
          appointmentPerson: 'Isaac Newton',
          appointmentAddress: 'Down the road, over there',
          appointmentTelephoneNumber: '0123456789',
          appointmentAlternativeTelephoneNumber: '02234567890',
          appointmentTime: '01/12/2021 00:34',
          appointmentTimeType: 'SPECIFIC_DATE_TIME',
        },
      },
    })
  },

  stubDiscardLicence: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'DELETE',
        urlPattern: `/licences-api/licence/id/(\\d*)/discard`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubUpdateSentenceDates: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licences-api/licence/id/(\\d*)/sentence-dates`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubMatchLicenceEvents: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/licences-api/events/match`,
        queryParameters: {
          licenceId: {
            matches: '.*',
          },
          eventType: {
            matches: '.*',
          },
          sortBy: {
            matches: '.*',
          },
          sortOrder: {
            matches: '.*',
          },
        },
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            id: 1,
            licenceId: 2,
            eventType: 'VARIATION_SUBMITTED_REASON',
            username: 'tcom',
            forenames: 'Test',
            surname: 'Com',
            eventDescription: 'Reason varied',
            eventTime: '12/06/2021 10:46:40',
          },
          {
            id: 2,
            licenceId: 2,
            eventType: 'VARIATION_REJECTED',
            username: 'tcom',
            forenames: 'Test',
            surname: 'Com',
            eventDescription: 'Reason rejected',
            eventTime: '12/06/2021 10:47:40',
          },
        ],
      },
    })
  },

  stubApproveVariation: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licences-api/licence/id/(\\d*)/approve-variation`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubReferVariation: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licences-api/licence/id/(\\d*)/refer-variation`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubUpdateStandardConditions: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licences-api/licence/id/(\\d*)/standard-conditions`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubGetLicencePolicyConditions: (version = ACTIVE_POLICY_VERSION): SuperAgentRequest => {
    let policy: LicencePolicyResponse
    switch (version) {
      case '2.0':
        // eslint-disable-next-line camelcase
        policy = policyV2_0
        break
      case '2.1':
        // eslint-disable-next-line camelcase
        policy = policyV2_1
        break
      case '3.0':
        // eslint-disable-next-line camelcase
        policy = policyV3_0
        break
      default:
        // eslint-disable-next-line camelcase
        policy = policyV3_0
        break
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/licence-policy/version/([0-9]+[.]+[0-9])`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: policy,
      },
    })
  },

  stubGetActivePolicyConditions: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/licence-policy/active`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        // eslint-disable-next-line camelcase
        jsonBody: policyV3_0,
      },
    })
  },

  stubUpdateOffenderDetails: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licences-api/offender/nomisid/.*/update-offender-details`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubSearchForOffenderOnStaffCaseload: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/licences-api/com/case-search`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          results: [
            {
              name: 'Test Person',
              crn: 'A123456',
              nomisId: 'A1234BC',
              comName: 'Test Staff',
              comStaffCode: '3000',
              teamName: 'Test Team',
              releaseDate: '16/08/2023',
              licenceId: 1,
              licenceType: 'AP',
              licenceStatus: LicenceStatus.IN_PROGRESS,
              isOnProbation: false,
              isDueForEarlyRelease: false,
              releaseDateLabel: 'CRD',
            },
          ],
          inPrisonCount: 1,
          onProbationCount: 0,
        },
      },
    })
  },

  stubGetBankHolidays: (dates: string[]): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/bank-holidays`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: dates,
      },
    })
  },

  stubAddAdditionalCondition: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/licences-api/licence/id/(\\d*)/additional-condition/([A-Z]{2,3})`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          id: 1,
          code: 'abc123',
          category: 'category1',
          sequence: 1,
          text: 'Condition text',
          expandedText: 'Expanded text',
          data: [{}],
          uploadSummary: [],
        },
      },
    })
  },

  stubGetLicenceWithSkippedInputs: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/licence/id/(\\d*)`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...licencePlaceholder,
          appointmentPersonType: 'SPECIFIC_PERSON',
          appointmentPerson: 'Isaac Newton',
          appointmentAddress: 'Down the road, over there',
          appointmentTelephoneNumber: '0123456789',
          appointmentAlternativeTelephoneNumber: '02234567890',
          appointmentTime: '01/12/2021 00:34',
          additionalLicenceConditions: [
            {
              id: 1,
              code: 'd36a3b77-30ba-40ce-8953-83e761d3b487',
              category: 'Electronic monitoring',
              sequence: 1,
              text: 'You must not drink any alcohol until [END DATE] unless your probation officer says you can. You will need to wear an electronic tag all the time so we can check this.',
              expandedText:
                'You must not drink any alcohol until unless your probation officer says you can. You will need to wear an electronic tag all the time so we can check this.',
              data: [{ conditionSkipped: '[DATE REQUIRED]' }],
              uploadSummary: [],
              readyToSubmit: false,
            },
          ],
        },
      },
    })
  },

  stubGetLicenceInHardStop: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/licence/id/(\\d*)`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...licencePlaceholder,
          isInHardStopPeriod: true,
        },
      },
    })
  },

  stubGetHardStopLicence: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/licence/id/(\\d*)`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...licencePlaceholder,
          kind: 'HARD_STOP',
          isInHardStopPeriod: true,
          appointmentPersonType: 'SPECIFIC_PERSON',
          appointmentPerson: 'Isaac Newton',
          appointmentAddress: 'Down the road, over there',
          appointmentTelephoneNumber: '0123456789',
          appointmentAlternativeTelephoneNumber: '02234567890',
          appointmentTime: '01/12/2021 00:34',
          appointmentTimeType: 'SPECIFIC_DATE_TIME',
        },
      },
    })
  },

  stubGetApprovedLicenceInHardStop: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/licence/id/(\\d*)`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...licencePlaceholder,
          statusCode: 'APPROVED',
          isInHardStopPeriod: true,
          electronicMonitoringProvider: {
            isToBeTaggedForProgramme: true,
            programmeName: 'Programme Name',
          },
          electronicMonitoringProviderStatus: 'COMPLETE',
        },
      },
    })
  },

  stubGetOmuEmail: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/omu/[A-Z]{3}/contact/email`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          email: 'test@test.test',
        },
      },
    })
  },

  stubPing: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/licences-api/health/ping',
      },
      response: {
        status: 200,
      },
    }),

  stubGetComReviewCount: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/com/(\\d*)/review-counts`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          myCount: 1,
          teams: [
            { teamCode: 'teamA', count: 2 },
            { teamCode: 'teamB', count: 3 },
          ],
        },
      },
    }),

  stubGetCaseloadItem: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/prisoner-search/nomisid/.*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          prisoner: {
            prisonerNumber: 'G4169UO',
            firstName: 'Test',
            lastName: 'Person',
            dateOfBirth: '1960-11-10',
            status: 'ACTIVE IN',
            prisonId: 'BAI',
            sentenceStartDate: '2017-03-01',
            releaseDate: '2024-07-19',
            confirmedReleaseDate: '2022-11-10',
            sentenceExpiryDate: '2028-08-31',
            licenceExpiryDate: '2028-08-31',
            conditionalReleaseDate: '2022-11-10',
          },
          cvl: { licenceType: 'AP', hardStopDate: null, hardStopWarningDate: null, isInhardStopPeriod: false },
        },
      },
    }),

  stubGetPssCaseloadItem: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/prisoner-search/nomisid/.*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          prisoner: {
            prisonerNumber: 'G4169UO',
            firstName: 'Test',
            lastName: 'Person',
            dateOfBirth: '1960-11-10',
            status: 'ACTIVE IN',
            prisonId: 'BAI',
            sentenceStartDate: '2017-03-01',
            releaseDate: '2024-07-19',
            confirmedReleaseDate: '2022-11-10',
            sentenceExpiryDate: '2028-08-31',
            topupSupervisoryStartDate: '2022-11-10',
            topupSupervisoryEndDate: '2028-08-31',
            conditionalReleaseDate: '2022-11-10',
          },
          cvl: { licenceType: 'PSS', hardStopDate: null, hardStopWarningDate: null, isInhardStopPeriod: false },
        },
      },
    }),

  stubGetHdcCaseloadItem: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/prisoner-search/nomisid/.*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          prisoner: {
            prisonerNumber: 'G9786GC',
            bookingId: '1201102',
            firstName: 'Test',
            lastName: 'Person',
            dateOfBirth: '1960-11-10',
            status: 'ACTIVE IN',
            prisonId: 'BAI',
            sentenceStartDate: '2017-03-01',
            releaseDate: '2024-07-19',
            confirmedReleaseDate: '2022-11-10',
            sentenceExpiryDate: '2028-08-31',
            licenceExpiryDate: '2028-08-31',
            conditionalReleaseDate: '2022-11-10',
            homeDetentionCurfewActualDate: '2024-07-09',
            homeDetentionCurfewEligibilityDate: '2024-07-09',
          },
          cvl: { licenceType: 'AP', hardStopDate: null, hardStopWarningDate: null, isInhardStopPeriod: false },
        },
      },
    }),

  searchPrisonersByNomisIds: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/licences-api/prisoner-search/prisoner-numbers`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            cvl: {
              licenceType: 'AP',
              hardStopDate: '03/01/2023',
              hardStopWarningDate: '01/01/2023',
              isInHardStopPeriod: false,
              isDueForEarlyRelease: true,
            },
            prisoner: {
              prisonerNumber: 'G9786GC',
              bookingId: '1201102',
              bookNumber: '38518A',
              firstName: 'TEST',
              lastName: 'PERSON',
              dateOfBirth: '1940-12-20',
              gender: 'Male',
              youthOffender: false,
              status: 'ACTIVE IN',
              lastMovementTypeCode: 'ADM',
              lastMovementReasonCode: '24',
              inOutStatus: 'IN',
              prisonId: 'MDI',
              prisonName: 'Moorland (HMP & YOI)',
              cellLocation: 'RECP',
              dateCreated: '2022-07-05 10:30:00',
              aliases: [
                {
                  firstName: 'OTHER',
                  lastName: 'NAME',
                  dateOfBirth: '1939-11-19',
                  gender: 'Male',
                  ethnicity: 'Some ethnicity',
                },
              ],
              alerts: [
                {
                  alertType: 'H',
                  alertCode: 'HA2',
                  active: true,
                  expired: false,
                },
              ],
              legalStatus: 'RECALL',
              imprisonmentStatus: 'CUR_ORA',
              imprisonmentStatusDescription: 'ORA Recalled from Curfew Conditions',
              indeterminateSentence: false,
              receptionDate: '2021-01-08',
              locationDescription: 'Moorland (HMP & YOI)',
              restrictedPatient: false,
              conditionalReleaseDate: nextMonth,
            },
          },
        ],
      },
    })
  },

  searchPssPrisonersByNomisIds: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/licences-api/prisoner-search/prisoner-numbers`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            cvl: {
              licenceType: 'PSS',
              hardStopDate: '03/01/2023',
              hardStopWarningDate: '01/01/2023',
              isInHardStopPeriod: false,
              isDueForEarlyRelease: true,
            },
            prisoner: {
              prisonerNumber: 'G9786GC',
              bookingId: '1201102',
              bookNumber: '38518A',
              firstName: 'TEST',
              lastName: 'PERSON',
              dateOfBirth: '1940-12-20',
              gender: 'Male',
              youthOffender: false,
              status: 'ACTIVE IN',
              lastMovementTypeCode: 'ADM',
              lastMovementReasonCode: '24',
              inOutStatus: 'IN',
              prisonId: 'MDI',
              prisonName: 'Moorland (HMP & YOI)',
              cellLocation: 'RECP',
              dateCreated: '2022-07-05 10:30:00',
              aliases: [
                {
                  firstName: 'OTHER',
                  lastName: 'NAME',
                  dateOfBirth: '1939-11-19',
                  gender: 'Male',
                  ethnicity: 'Some ethnicity',
                },
              ],
              alerts: [
                {
                  alertType: 'H',
                  alertCode: 'HA2',
                  active: true,
                  expired: false,
                },
              ],
              legalStatus: 'RECALL',
              imprisonmentStatus: 'CUR_ORA',
              imprisonmentStatusDescription: 'ORA Recalled from Curfew Conditions',
              indeterminateSentence: false,
              receptionDate: '2021-01-08',
              locationDescription: 'Moorland (HMP & YOI)',
              restrictedPatient: false,
              conditionalReleaseDate: nextMonth,
            },
          },
        ],
      },
    })
  },

  searchPrisonersByReleaseDate: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/licences-api/release-date-by-prison`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          page: {
            size: 2000,
            number: 0,
            totalElements: 1,
            totalPages: 1,
          },
          content: {
            cvl: {
              licenceType: 'AP',
              hardStopDate: '03/01/2023',
              hardStopWarningDate: '01/01/2023',
              isInHardStopPeriod: true,
              isDueForEarlyRelease: true,
            },
            prisoner: {
              prisonerNumber: 'G9786GC',
              bookingId: '1',
              bookNumber: '38518A',
              firstName: 'TEST',
              lastName: 'PERSON',
              dateOfBirth: '1940-12-20',
              gender: 'Male',
              youthOffender: false,
              status: 'ACTIVE IN',
              lastMovementTypeCode: 'ADM',
              lastMovementReasonCode: '24',
              inOutStatus: 'IN',
              prisonId: 'MDI',
              prisonName: 'Moorland (HMP & YOI)',
              cellLocation: 'RECP',
              aliases: [
                {
                  firstName: 'OTHER',
                  lastName: 'NAME',
                  dateOfBirth: '1939-11-19',
                  gender: 'Male',
                  ethnicity: 'Some ethnicity',
                },
              ],
              alerts: [
                {
                  alertType: 'H',
                  alertCode: 'HA2',
                  active: true,
                  expired: false,
                },
              ],
              legalStatus: 'RECALL',
              imprisonmentStatus: 'CUR_ORA',
              imprisonmentStatusDescription: 'ORA Recalled from Curfew Conditions',
              indeterminateSentence: false,
              receptionDate: '2021-01-08',
              locationDescription: 'Moorland (HMP & YOI)',
              restrictedPatient: false,
              conditionalReleaseDate: nextThirtyDays,
            },
          },
        },
      },
    })
  },

  stubGetCaseloadItemInHardStop: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/prisoner-search/nomisid/.*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          prisoner: {
            prisonerNumber: 'G9786GC',
            firstName: 'Test',
            lastName: 'Person',
            dateOfBirth: '1940-12-20',
            status: 'ACTIVE IN',
            prisonId: 'MDI',
            sentenceStartDate: '2017-03-01',
            releaseDate: '2024-07-19',
            confirmedReleaseDate: '2022-11-20',
            sentenceExpiryDate: '2028-08-31',
            licenceExpiryDate: '2028-08-31',
            conditionalReleaseDate: '2022-11-21',
          },
          cvl: {
            licenceType: 'AP',
            hardStopDate: '03/01/2023',
            hardStopWarningDate: '01/01/2023',
            isInHardStopPeriod: true,
            isDueForEarlyRelease: true,
          },
        },
      },
    }),
  stubDeactivateLicenceAndVariations: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/licences-api/licence/id/(\\d*)/deactivate-licence-and-variations`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubGetApprovalCaseload: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/licences-api/caseload/prison-approver/approval-needed`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            licenceId: licencePlaceholder.id,
            name: `${licencePlaceholder.forename} ${licencePlaceholder.surname}`,
            prisonerNumber: licencePlaceholder.nomsId,
            submittedByFullName: 'Test Submitter',
            releaseDate: licencePlaceholder.actualReleaseDate,
            urgentApproval: false,
            approvedBy: null,
            approvedOn: null,
            isDueForEarlyRelease: false,
            probationPractitioner: probationPractitionerPlaceholder,
          },
        ],
      },
    })
  },

  stubGetRecentlyApproved: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/licences-api/caseload/prison-approver/recently-approved`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            licenceId: licencePlaceholder.id,
            name: `${licencePlaceholder.forename} ${licencePlaceholder.surname}`,
            prisonerNumber: licencePlaceholder.nomsId,
            submittedByFullName: 'Test Submitter',
            releaseDate: licencePlaceholder.actualReleaseDate,
            urgentApproval: false,
            approvedBy: 'Test Approver',
            approvedOn: '03/07/2024 12:30:00',
            isDueForEarlyRelease: false,
            probationPractitioner: probationPractitionerPlaceholder,
          },
        ],
      },
    })
  },

  stubGetPrisonOmuCaseload: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/licences-api/caseload/case-admin/prison-view`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            kind: 'CRD',
            licenceId: 1,
            name: 'Another Person',
            prisonerNumber: 'AB1234E',
            probationPractitioner: {
              name: 'John Smith',
              staffCode: 'X1234',
            },
            releaseDate: '01/05/2022',
            releaseDateLabel: 'Confirmed release date',
            licenceStatus: 'APPROVED',
            tabType: 'FUTURE_RELEASES',
            nomisLegalStatus: 'SENTENCED',
            lastWorkedOnBy: 'X Y',
            isDueForEarlyRelease: false,
            isInHardStopPeriod: true,
          },
        ],
      },
    })
  },
  stubGetProbationOmuCaseload: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/licences-api/caseload/case-admin/probation-view`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            kind: 'CRD',
            licenceId: 2,
            name: 'Another Person',
            prisonerNumber: 'AB1234E',
            probationPractitioner: {
              name: 'Joe Bloggs',
              staffCode: 'X1234',
            },
            releaseDate: '01/05/2022',
            releaseDateLabel: 'Confirmed release date',
            licenceStatus: 'ACTIVE',
            tabType: null,
            nomisLegalStatus: 'SENTENCED',
            lastWorkedOnBy: 'X Y',
            isDueForEarlyRelease: true,
            isInHardStopPeriod: false,
          },
        ],
      },
    })
  },
  stubGetStaffCreateCaseload: (options: {
    licenceId: number
    licenceStatus: string
    licenceCreationType: string
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/caseload/com/staff/(\\d)*/create-case-load`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            name: 'Test Person',
            crnNumber: 'X344165',
            prisonerNumber: 'G9786GC',
            releaseDate: '01/09/2024',
            licenceId: options.licenceId,
            licenceStatus: options.licenceStatus,
            licenceType: 'PSS',
            probationPractitioner: { staffCode: 'X12345', name: 'John Smith' },
            hardStopDate: '03/01/2023',
            hardStopWarningDate: '01/01/2023',
            isDueForEarlyRelease: true,
            licenceCreationType: options.licenceCreationType,
          },
        ],
      },
    })
  },
  stubGetStaffCreateCaseloadForHardStop: (options: {
    licenceId: number
    licenceStatus: string
    licenceCreationType: string
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/caseload/com/staff/(\\d)*/create-case-load`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            name: 'Test Person',
            crnNumber: 'X344165',
            prisonerNumber: 'G9786GC',
            releaseDate: '01/09/2024',
            licenceId: options && options.licenceId,
            licenceStatus: 'TIMED_OUT',
            licenceType: 'AP',
            probationPractitioner: { staffCode: 'X12345', name: 'John Smith' },
            hardStopDate: '03/01/2023',
            hardStopWarningDate: '01/01/2023',
            isDueForEarlyRelease: true,
            licenceCreationType: LicenceCreationType.PRISON_WILL_CREATE_THIS_LICENCE,
            isInHardStopPeriod: true,
          },
        ],
      },
    })
  },
  stubGetStaffVaryCaseload: (options: {
    licenceId: number
    licenceStatus: string
    licenceCreationType: string
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licences-api/caseload/com/staff/(\\d)*/vary-case-load`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            name: 'Test Person',
            crnNumber: 'X344165',
            prisonerNumber: 'G9786GC',
            releaseDate: '01/09/2024',
            licenceId: options.licenceId,
            licenceStatus: options.licenceStatus,
            licenceType: 'PSS',
            probationPractitioner: { staffCode: 'X12345', name: 'John Smith' },
            hardStopDate: '03/01/2023',
            hardStopWarningDate: '01/01/2023',
            isDueForEarlyRelease: true,
            licenceCreationType: options.licenceCreationType,
          },
        ],
      },
    })
  },

  stubDeleteAdditionalConditionById: () => {
    return stubFor({
      request: {
        method: 'DELETE',
        urlPattern: `/licences-api/licence/id/(\\d)*/additional-condition/id/(\\d)`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubDeleteAdditionalConditionsByCode: () => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/licences-api/licence/id/(\\d)*/delete-additional-conditions-by-code`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubPostExclusionZone: () => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/licences-api/exclusion-zone/id/(\\d)/condition/id/(\\d)/file-upload`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubGetVaryApproverCaseload: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/licences-api/caseload/vary-approver`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            licenceId: 1,
            licenceStatus: LicenceStatus.VARIATION_SUBMITTED,
            name: 'Test Person',
            crnNumber: 'X12345',
            licenceType: 'AP',
            releaseDate: '23/03/2022',
            variationRequestedDate: '01/03/2021',
            probationPractitioner: 'jsmith',
          },
        ],
      },
    })
  },
  stubGetCaSearchInPrisonResult: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/licences-api/caseload/case-admin/case-search`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          inPrisonResults: [
            {
              kind: 'CRD',
              licenceId: 1,
              name: 'Test Person 1',
              prisonerNumber: 'A1234AA',
              probationPractitioner: {
                name: 'Test Com 1',
                staffCode: 'A12345',
              },
              releaseDate: '01/07/2025',
              releaseDateLabel: 'Confirmed release date',
              licenceStatus: 'APPROVED',
              tabType: 'FUTURE_RELEASES',
              nomisLegalStatus: 'SENTENCED',
              lastWorkedOnBy: 'Test Updater',
              isDueForEarlyRelease: false,
              isInHardStopPeriod: true,
              prisonCode: 'LEI',
              prisonDescription: 'Leeds (HMP)',
            },
          ],
          onProbationResults: [],
        },
      },
    })
  },
  stubGetCaSearchOnProbationResult: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/licences-api/caseload/case-admin/case-search`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          inPrisonResults: [],
          onProbationResults: [
            {
              kind: 'CRD',
              licenceId: 4,
              licenceVersionOf: 1.3,
              name: 'Test Person 4',
              prisonerNumber: 'A1234DD',
              probationPractitioner: {
                name: 'Test Com 2',
                staffCode: 'B12345',
                staffIdentifier: 120001212,
                staffUsername: 'tcom2',
              },
              releaseDate: '01/05/2025',
              releaseDateLabel: 'Confirmed release date',
              licenceStatus: 'ACTIVE',
              tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
              nomisLegalStatus: 'SENTENCED',
              lastWorkedOnBy: 'Test Updater',
              isDueForEarlyRelease: false,
              isInHardStopPeriod: true,
              prisonCode: 'LEI',
              prisonDescription: 'Leeds (HMP)',
            },
          ],
        },
      },
    })
  },
  stubGetCaSearchResults: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/licences-api/caseload/case-admin/case-search`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          inPrisonResults: [
            {
              kind: 'CRD',
              licenceId: 1,
              name: 'Test Person 1',
              prisonerNumber: 'A1234AA',
              probationPractitioner: {
                name: 'Test Com 1',
                staffCode: 'A12345',
              },
              releaseDate: '01/07/2025',
              releaseDateLabel: 'Confirmed release date',
              licenceStatus: 'APPROVED',
              tabType: 'FUTURE_RELEASES',
              nomisLegalStatus: 'SENTENCED',
              lastWorkedOnBy: 'Test Updater',
              isDueForEarlyRelease: false,
              isInHardStopPeriod: true,
              prisonCode: 'MDI',
              prisonDescription: 'Moorland (HMP)',
            },
            {
              kind: 'CRD',
              licenceId: 2,
              name: 'Test Person 2',
              prisonerNumber: 'A1234BB',
              probationPractitioner: {
                name: 'Test Com 1',
                staffCode: 'A12345',
              },
              releaseDate: '01/08/2025',
              releaseDateLabel: 'Confirmed release date',
              licenceStatus: 'APPROVED',
              tabType: 'FUTURE_RELEASES',
              nomisLegalStatus: 'SENTENCED',
              lastWorkedOnBy: 'Test Updater',
              isDueForEarlyRelease: false,
              isInHardStopPeriod: true,
              prisonCode: 'MDI',
              prisonDescription: 'Moorland (HMP)',
            },
            {
              kind: 'CRD',
              licenceId: 3,
              name: 'Test Person 3',
              prisonerNumber: 'A1234CC',
              probationPractitioner: {
                name: 'Test Com 2',
                staffCode: 'B12345',
              },
              releaseDate: '02/08/2025',
              releaseDateLabel: 'Confirmed release date',
              licenceStatus: 'APPROVED',
              tabType: 'FUTURE_RELEASES',
              nomisLegalStatus: 'SENTENCED',
              lastWorkedOnBy: 'Test Updater',
              isDueForEarlyRelease: false,
              isInHardStopPeriod: false,
              prisonCode: 'BAI',
              prisonDescription: 'Belmarsh (HMP)',
            },
          ],
          onProbationResults: [
            {
              kind: 'CRD',
              licenceId: 4,
              licenceVersionOf: 1.3,
              name: 'Test Person 4',
              prisonerNumber: 'A1234DD',
              probationPractitioner: {
                name: 'Test Com 2',
                staffCode: 'B12345',
                staffIdentifier: 120001212,
                staffUsername: 'tcom2',
              },
              releaseDate: '01/05/2025',
              releaseDateLabel: 'Confirmed release date',
              licenceStatus: 'ACTIVE',
              tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
              nomisLegalStatus: 'SENTENCED',
              lastWorkedOnBy: 'Test Updater',
              isDueForEarlyRelease: false,
              isInHardStopPeriod: true,
              prisonCode: 'LEI',
              prisonDescription: 'Leeds (HMP)',
            },
            {
              kind: 'CRD',
              licenceId: 5,
              licenceVersionOf: 1.3,
              name: 'Test Person 5',
              prisonerNumber: 'A1234EE',
              probationPractitioner: {
                name: 'Test Com 1',
                staffCode: 'A12345',
                staffIdentifier: 120001111,
                staffUsername: 'tcom1',
              },
              releaseDate: '30/04/2025',
              releaseDateLabel: 'Confirmed release date',
              licenceStatus: 'ACTIVE',
              tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
              nomisLegalStatus: 'SENTENCED',
              lastWorkedOnBy: 'Test Updater',
              isDueForEarlyRelease: false,
              isInHardStopPeriod: false,
              prisonCode: 'BAI',
              prisonDescription: 'Belmarsh (HMP)',
            },
            {
              kind: 'CRD',
              licenceId: 6,
              licenceVersionOf: 1.3,
              name: 'Test Person 6',
              prisonerNumber: 'A1234FF',
              probationPractitioner: {
                name: 'Test Com 2',
                staffCode: 'B12345',
                staffIdentifier: 120001212,
                staffUsername: 'tcom2',
              },
              releaseDate: '29/04/2025',
              releaseDateLabel: 'Confirmed release date',
              licenceStatus: 'ACTIVE',
              tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
              nomisLegalStatus: 'SENTENCED',
              lastWorkedOnBy: 'Test Updater',
              isDueForEarlyRelease: false,
              isInHardStopPeriod: false,
              prisonCode: 'LEI',
              prisonDescription: 'Leeds (HMP)',
            },
          ],
        },
      },
    })
  },
  stubGetCaSearchAttentionNeededPrisonResults: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/licences-api/caseload/case-admin/case-search`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          inPrisonResults: [
            {
              kind: 'CRD',
              licenceId: 1,
              name: 'Test Person 1',
              prisonerNumber: 'A1234AA',
              probationPractitioner: {
                name: 'Test Com 1',
                staffCode: 'A12345',
              },
              releaseDate: null,
              releaseDateLabel: 'CRD',
              licenceStatus: 'SUBMITTED',
              tabType: 'ATTENTION_NEEDED',
              nomisLegalStatus: 'RECALL',
              lastWorkedOnBy: 'Test Updater',
              isDueForEarlyRelease: false,
              isInHardStopPeriod: true,
              prisonCode: 'MDI',
              prisonDescription: 'Moorland (HMP)',
            },
            {
              kind: 'CRD',
              licenceId: 2,
              name: 'Test Person 2',
              prisonerNumber: 'A1234AB',
              probationPractitioner: {
                name: 'Test Com 1',
                staffCode: 'A12345',
              },
              releaseDate: null,
              releaseDateLabel: 'CRD',
              licenceStatus: 'SUBMITTED',
              tabType: 'ATTENTION_NEEDED',
              nomisLegalStatus: 'REMAND',
              lastWorkedOnBy: 'Test Updater',
              isDueForEarlyRelease: false,
              isInHardStopPeriod: true,
              prisonCode: 'MDI',
              prisonDescription: 'Moorland (HMP)',
            },
            {
              kind: 'CRD',
              licenceId: 3,
              name: 'Test Person 3',
              prisonerNumber: 'A1234AC',
              probationPractitioner: {
                name: 'Test Com 1',
                staffCode: 'A12345',
              },
              releaseDate: null,
              releaseDateLabel: 'CRD',
              licenceStatus: 'SUBMITTED',
              tabType: 'ATTENTION_NEEDED',
              nomisLegalStatus: 'SENTENCED',
              lastWorkedOnBy: 'Test Updater',
              isDueForEarlyRelease: false,
              isInHardStopPeriod: true,
              prisonCode: 'MDI',
              prisonDescription: 'Moorland (HMP)',
            },
          ],
          onProbationResults: [],
        },
      },
    })
  },
  stubGetPrisonApproverSearchApprovalNeededResult: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/licences-api/caseload/prison-approver/case-search`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          approvalNeededResponse: [
            {
              licenceId: 1,
              name: 'Test Person 1',
              prisonerNumber: 'A1234AA',
              probationPractitioner: {
                name: 'Com Four',
              },
              submittedByFullName: 'Submitted Person',
              releaseDate: '01/07/2025',
              urgentApproval: false,
              isDueForEarlyRelease: false,
              approvedBy: null,
              approvedOn: null,
              kind: 'CRD',
              prisonCode: 'MDI',
              prisonDescription: 'Moorland (HMP)',
            },
          ],
          recentlyApprovedResponse: [],
        },
      },
    })
  },
  stubGetPrisonApproverSearchRecentlyApprovedResult: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/licences-api/caseload/prison-approver/case-search`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          approvalNeededResponse: [],
          recentlyApprovedResponse: [
            {
              licenceId: 4,
              name: 'Test Person 4',
              prisonerNumber: 'A1234AD',
              releaseDate: '01/05/2025',
              probationPractitioner: {
                name: 'Com Four',
              },
              submittedByFullName: 'Submitted Person',
              urgentApproval: false,
              isDueForEarlyRelease: false,
              approvedBy: 'An Approver',
              approvedOn: '13/04/2023 00:00:00',
              kind: 'CRD',
              prisonCode: 'MDI',
              prisonDescription: 'Moorland (HMP)',
            },
          ],
        },
      },
    })
  },
  stubGetPrisonApproverSearchResults: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/licences-api/caseload/prison-approver/case-search`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          approvalNeededResponse: [
            {
              licenceId: 1,
              name: 'Test Person 1',
              prisonerNumber: 'A1234AA',
              probationPractitioner: {
                name: 'Com Four',
              },
              submittedByFullName: 'Submitted Person',
              releaseDate: '01/07/2025',
              urgentApproval: false,
              isDueForEarlyRelease: false,
              approvedBy: null,
              approvedOn: null,
              kind: 'CRD',
              prisonCode: 'MDI',
              prisonDescription: 'Moorland (HMP)',
            },
            {
              licenceId: 2,
              name: 'Test Person 2',
              prisonerNumber: 'A1234AB',
              probationPractitioner: {
                name: 'Com Three',
              },
              submittedByFullName: 'Submitted Person',
              releaseDate: '01/08/2025',
              urgentApproval: true,
              isDueForEarlyRelease: true,
              approvedBy: null,
              approvedOn: null,
              kind: 'CRD',
              prisonCode: 'LEI',
              prisonDescription: 'Leeds (HMP)',
            },
            {
              licenceId: 3,
              name: 'Test Person 3',
              prisonerNumber: 'A1234AC',
              probationPractitioner: {
                name: 'Com Three',
              },
              submittedByFullName: 'Submitted Person',
              releaseDate: '02/08/2025',
              urgentApproval: true,
              isDueForEarlyRelease: true,
              approvedBy: null,
              approvedOn: null,
              kind: 'CRD',
              prisonCode: 'MDI',
              prisonDescription: 'Moorland (HMP)',
            },
          ],
          recentlyApprovedResponse: [
            {
              licenceId: 4,
              name: 'Test Person 4',
              prisonerNumber: 'A1234AD',
              releaseDate: '01/05/2025',
              probationPractitioner: {
                name: 'Com Four',
              },
              submittedByFullName: 'Submitted Person',
              urgentApproval: false,
              isDueForEarlyRelease: false,
              approvedBy: 'An Approver',
              approvedOn: '13/04/2023 00:00:00',
              kind: 'CRD',
              prisonCode: 'MDI',
              prisonDescription: 'Moorland (HMP)',
            },
            {
              licenceId: 5,
              name: 'Test Person 5',
              prisonerNumber: 'A1234AE',
              releaseDate: '30/04/2025',
              probationPractitioner: {
                name: 'Com Four',
              },
              submittedByFullName: 'Submitted Person',
              urgentApproval: false,
              isDueForEarlyRelease: false,
              approvedBy: 'An Approver',
              approvedOn: '10/04/2023 00:00:00',
              kind: 'CRD',
              prisonCode: 'MDI',
              prisonDescription: 'Moorland (HMP)',
            },
            {
              licenceId: 6,
              name: 'Test Person 6',
              prisonerNumber: 'A1234AF',
              probationPractitioner: {
                name: 'Com Two',
              },
              submittedByFullName: 'Submitted Person',
              releaseDate: '29/04/2025',
              urgentApproval: true,
              isDueForEarlyRelease: true,
              approvedBy: 'An Approver',
              approvedOn: '12/04/2023 00:00:00',
              kind: 'CRD',
              prisonCode: 'BAI',
              prisonDescription: 'Belmarsh (HMP)',
            },
          ],
        },
      },
    })
  },
}
