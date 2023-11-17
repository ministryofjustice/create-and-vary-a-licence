import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'
import LicenceStatus from '../../server/licences/licenceStatus'
// eslint-disable-next-line camelcase
import policyV2_0 from './polices/v2-0'
// eslint-disable-next-line camelcase
import policyV2_1 from './polices/v2-1'

const ACTIVE_POLICY_VERSION = '2.1'

const licencePlaceholder = {
  id: 1,
  typeCode: 'AP_PSS',
  version: ACTIVE_POLICY_VERSION,
  statusCode: 'IN_PROGRESS',
  nomsId: 'G9786GC',
  bookingNo: '123456',
  bookingId: '54321',
  crn: 'X12345',
  pnc: '2019/123445',
  cro: '12345',
  prisonCode: 'LEI',
  prisonDescription: 'Leeds (HMP)',
  forename: 'Bob',
  surname: 'Zimmer',
  dateOfBirth: '12/02/1980',
  conditionalReleaseDate: '13/03/2021',
  actualReleaseDate: '01/04/2021',
  sentenceStartDate: '10/01/2019',
  sentenceEndDate: '26/04/2022',
  licenceStartDate: '01/04/2021',
  licenceExpiryDate: '26/04/2060',
  topupSupervisionStartDate: '26/04/2022',
  topupSupervisionExpiryDate: '26/06/2060',
  comFirstName: 'John',
  comLastName: 'Smith',
  comUsername: 'jsmith',
  comStaffId: '12345',
  comEmail: 'john.smith@nps.gov.uk',
  comTelephone: '08002345557',
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
      data: [{}],
      uploadSummary: [],
      readyToSubmit: true,
    },
  ],
  bespokeConditions: [],
  additionalPssConditions: [],
}

export default {
  updateComDetails: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/com/update`,
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
        urlPattern: `/offender/crn/.*/responsible-com`,
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
        urlPattern: `/offender/crn/.*/probation-team`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    })
  },

  stubGetLicence: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licence/id/(\\d)*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: licencePlaceholder,
      },
    })
  },

  stubGetPolicyChanges: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licence-policy/compare/(\\d.\\d)/licence/((\\d))`,
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

  stubGetNextPolicyChange: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `licence/vary/id/(\\d)/policy-changes/condition/(\\d)`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubGetCompletedLicence: (options: { statusCode: string; typeCode: 'AP_PSS' | 'AP' | 'PSS' }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licence/id/(\\d)*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...licencePlaceholder,
          statusCode: options.statusCode, // Overrides licencePlaceHolder status
          typeCode: options.typeCode, // Overrides licence status code
          appointmentPerson: 'Isaac Newton',
          appointmentAddress: 'Down the road, over there',
          appointmentContact: '07891245678',
          appointmentTime: '01/12/2021 00:34',
          additionalLicenceConditions: [
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
                },
              ],
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
                },
                {
                  id: 3,
                  sequence: 0,
                  field: 'age',
                  value: '16',
                },
              ],
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
                },
                {
                  id: 5,
                  sequence: 1,
                  field: 'behaviourProblems',
                  value: 'debt',
                },
              ],
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
                },
                {
                  id: 7,
                  sequence: 1,
                  field: 'curfewStart',
                  value: '7:30pm',
                },
                {
                  id: 8,
                  sequence: 2,
                  field: 'curfewEnd',
                  value: '7:30am',
                },
                {
                  id: 9,
                  sequence: 3,
                  field: 'reviewPeriod',
                  value: 'Other',
                },
                {
                  id: 10,
                  sequence: 4,
                  field: 'alternativeReviewPeriod',
                  value: 'Annually',
                },
              ],
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
                },
                {
                  id: 12,
                  sequence: 1,
                  field: 'item',
                  value: 'Needles',
                },
              ],
              uploadSummary: [],
              readyToSubmit: true,
            },
          ],
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
                'Attend 123 Fake Street, Fakestown, London, SW2 5XF, as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
              data: [
                {
                  id: 1,
                  sequence: 0,
                  field: 'appointmentAddress',
                  value: '123 Fake Street, , Fakestown, London, SW2 5XF',
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
                  value: '123 Fake Street, , Fakestown, London, SW2 5XF',
                },
              ],
              readyToSubmit: true,
            },
          ],
        },
      },
    })
  },

  stubPostLicence: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: '/licence/create',
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

  stubGetExistingLicenceForOffenderWithResult: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/licence/match`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            licenceId: 1,
            nomisId: 'G9786GC',
          },
        ],
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
        urlPathPattern: `/licence/match`,
        bodyPatterns: [
          {
            matchesJsonPath: {
              expression: '$.status',
              contains: 'ACTIVE',
            },
          },
          {
            matchesJsonPath: {
              expression: '$.status',
              contains: 'VARIATION_IN_PROGRESS',
            },
          },
          {
            matchesJsonPath: {
              expression: '$.status',
              contains: 'VARIATION_SUBMITTED',
            },
          },
          {
            matchesJsonPath: {
              expression: '$.status',
              contains: 'VARIATION_REJECTED',
            },
          },
          {
            matchesJsonPath: {
              expression: '$.status',
              contains: 'VARIATION_APPROVED',
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
                forename: 'Bob',
                surname: 'Zimmer',
                crn: 'X12345',
                licenceType: 'AP',
                actualReleaseDate: '23/03/2022',
                comUsername: 'jsmith',
                bookingId: options.bookingId,
                conditionalReleaseDate: '13/04/2023',
                dateCreated: '01/03/2021 10:15',
              },
            ]
          : [],
      },
    })
  },

  stubGetLicencesForOffender: (options: { nomisId: string; status: string; bookingId: number }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/licence/match`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            licenceId: 1,
            nomisId: options.nomisId,
            licenceStatus: options.status,
            forename: 'Bob',
            surname: 'Zimmer',
            crn: 'X12345',
            licenceType: 'AP',
            actualReleaseDate: '23/03/2022',
            comUsername: 'jsmith',
            bookingId: options.bookingId,
            dateCreated: '01/03/2021 10:15',
          },
        ],
      },
    })
  },

  stubGetVariationsSubmittedByRegionForOffender: (options: {
    nomisId: string
    bookingId: number
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/licence/variations/submitted/area/(\\w)*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            licenceId: 1,
            nomisId: options.nomisId,
            licenceStatus: LicenceStatus.VARIATION_SUBMITTED,
            forename: 'Bob',
            surname: 'Zimmer',
            crn: 'X12345',
            licenceType: 'AP',
            actualReleaseDate: '23/03/2022',
            comUsername: 'jsmith',
            bookingId: options.bookingId,
            dateCreated: '01/03/2021 10:15',
          },
        ],
      },
    })
  },

  stubGetHdcLicencesForOffender: (options: { bookingId: number; status: string }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/api/offender-sentences/booking/(\\d)*/home-detention-curfews/latest',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          approvalStatus: options.status,
          approvalStatusDate: null,
          bookingId: options.bookingId,
          checksPassedDate: null,
          passed: true,
          refusedReason: '',
        },
      },
    })
  },

  stubPutAppointmentPerson: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licence/id/(\\d)*/appointmentPerson`,
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
        urlPattern: `/licence/id/(\\d)*/appointmentTime`,
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
        urlPattern: `/licence/id/(\\d)*/appointment-address`,
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
        urlPattern: `/licence/id/(\\d)*/contact-number`,
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
        urlPattern: `/licence/id/(\\d)*/bespoke-conditions`,
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
        urlPattern: `/licence/id/(\\d)*/additional-conditions`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubGetLicenceWithConditionToComplete: (code: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licence/id/(\\d)*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...licencePlaceholder,
          additionalLicenceConditions: [
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

  stubGetLicenceWithPssConditionToComplete: (code: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licence/id/(\\d)*`,
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
        urlPattern: `/licence/id/(\\d)*/additional-conditions/condition/(\\d)*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubGetExistingLicencesForOffenders: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/licence/match`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            licenceId: 1,
            licenceStatus: 'IN_PROGRESS',
            nomisId: 'G9786GC',
          },
        ],
      },
    })
  },

  stubGetExistingLicenceForOffenderNoResult: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/licence/match`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [],
      },
    })
  },

  stubGetLicencesForStatus: (status: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/licence/match`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            licenceId: licencePlaceholder.id,
            licenceType: licencePlaceholder.typeCode,
            licenceStatus: status,
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
            variationOf: status === 'VARIATION_SUBMITTED' ? 2 : null,
          },
        ],
      },
    })
  },

  stubSubmitStatus: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licence/id/(\\d*)/submit`,
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
        urlPattern: `/licence/id/(\\d*)/status`,
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
        urlPattern: `/audit/save`,
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
        urlPattern: `/licence/id/(\\d*)/create-variation`,
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
        urlPattern: `/licence/id/(\\d*)/spo-discussion`,
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
        urlPattern: `/licence/id/(\\d*)/vlo-discussion`,
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
        urlPattern: `/licence/id/(\\d*)/reason-for-variation`,
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
        urlPattern: `/licence/id/(\\d*)`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...licencePlaceholder,
          id: 2,
          version: licenceVersion,
          variationOf: 1,
          isVariation: true,
          statusCode: 'VARIATION_IN_PROGRESS',
          spoDiscussion: 'Yes',
          vloDiscussion: 'Yes',
          appointmentPerson: 'Isaac Newton',
          appointmentAddress: 'Down the road, over there',
          appointmentContact: '07891245678',
          appointmentTime: '01/12/2021 00:34',
        },
      },
    })
  },

  stubDiscardLicence: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'DELETE',
        urlPattern: `/licence/id/(\\d*)/discard`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubUpdatePrisonInformation: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licence/id/(\\d*)/prison-information`,
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
        urlPattern: `/licence/id/(\\d*)/sentence-dates`,
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
        urlPathPattern: `/events/match`,
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
            username: 'smills',
            forenames: 'Stephen',
            surname: 'Mills',
            eventDescription: 'Reason varied',
            eventTime: '12/06/2021 10:46:40',
          },
          {
            id: 2,
            licenceId: 2,
            eventType: 'VARIATION_REJECTED',
            username: 'smills',
            forenames: 'Stephen',
            surname: 'Mills',
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
        urlPattern: `/licence/id/(\\d*)/approve-variation`,
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
        urlPattern: `/licence/id/(\\d*)/refer-variation`,
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
        urlPattern: `/licence/id/(\\d*)/standard-conditions`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubGetLicencePolicyConditions: (version = ACTIVE_POLICY_VERSION): SuperAgentRequest => {
    let policy
    switch (version) {
      case '2.0':
        // eslint-disable-next-line camelcase
        policy = policyV2_0
        break
      case '2.1':
        // eslint-disable-next-line camelcase
        policy = policyV2_1
        break
      default:
        // eslint-disable-next-line camelcase
        policy = policyV2_1
        break
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licence-policy/version/([0-9]+[.]+[0-9])`,
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
        urlPattern: `/licence-policy/active`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        // eslint-disable-next-line camelcase
        jsonBody: policyV2_1,
      },
    })
  },

  stubUpdateOffenderDetails: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/offender/nomisid/.*/update-offender-details`,
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
        urlPattern: `/com/case-search`,
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
              releaseDate: '2023-08-16',
              licenceId: 1,
              licenceType: 'AP',
              licenceStatus: LicenceStatus.IN_PROGRESS,
              isOnProbation: false,
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
        urlPattern: `/bank-holidays`,
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
        urlPattern: `/licence/id/(\\d*)/additional-condition/([A-Z]{2,3})`,
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
}
