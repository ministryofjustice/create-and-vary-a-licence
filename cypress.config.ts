// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'cypress'
import 'reflect-metadata'
import moment, { Moment } from 'moment/moment'
import { resetStubs, verifyEndpointCalled } from './integration_tests/wiremock'
import auth from './integration_tests/mockApis/auth'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import licence from './integration_tests/mockApis/licence'
import community from './integration_tests/mockApis/community'
import prisonerSearch from './integration_tests/mockApis/prisonerSearch'
import prison from './integration_tests/mockApis/prison'
import probationSearch from './integration_tests/mockApis/probationSearch'
import events from './integration_tests/support/events'
import feComponent from './integration_tests/mockApis/feComponent'

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'integration_tests/fixtures',
  screenshotsFolder: 'integration_tests/screenshots',
  videosFolder: 'integration_tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  taskTimeout: 60000,
  viewportHeight: 1200,
  viewportWidth: 1300,
  e2e: {
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,
        verifyEndpointCalled,

        getSignInUrl: auth.getSignInUrl,
        stubPrisonSignIn: auth.stubPrisonSignIn,
        stubProbationSignIn: auth.stubProbationSignIn,
        stubProbationAcoSignIn: auth.stubProbationAcoSignIn,
        stubAuthUser: auth.stubUser,
        stubAuthPing: auth.stubPing,
        stubSystemToken: auth.systemToken,

        stubFeComponents: feComponent.stubFeComponents,
        stubFeComponentsFail: feComponent.stubFeComponentsFail,

        stubTokenVerificationPing: tokenVerification.stubPing,

        stubUpdateResponsibleCom: licence.stubUpdateResponsibleCom,
        stubUpdateProbationTeam: licence.stubUpdateProbationTeam,
        stubGetLicence: licence.stubGetLicence,
        stubPostLicence: licence.stubPostLicence,
        stubGetExistingLicenceForOffenderWithResult: licence.stubGetExistingLicenceForOffenderWithResult,
        stubGetActiveAndVariationLicencesForOffender: licence.stubGetActiveAndVariationLicencesForOffender,
        stubGetLicencesForOffender: licence.stubGetLicencesForOffender,
        stubPutAppointmentPerson: licence.stubPutAppointmentPerson,
        stubPutAppointmentTime: licence.stubPutAppointmentTime,
        stubPutAppointmentAddress: licence.stubPutAppointmentAddress,
        stubPutContactNumber: licence.stubPutContactNumber,
        stubPutBespokeConditions: licence.stubPutBespokeConditions,
        stubPutAdditionalConditions: licence.stubPutAdditionalConditions,
        stubGetLicenceWithConditionToComplete: licence.stubGetLicenceWithConditionToComplete,
        stubGetLicenceWithPssConditionToComplete: licence.stubGetLicenceWithPssConditionToComplete,
        stubPutAdditionalConditionData: licence.stubPutAdditionalConditionData,
        stubGetExistingLicencesForOffenders: licence.stubGetExistingLicencesForOffenders,
        stubGetExistingLicenceForOffenderNoResult: licence.stubGetExistingLicenceForOffenderNoResult,
        stubSubmitStatus: licence.stubSubmitStatus,
        stubUpdateLicenceStatus: licence.stubUpdateLicenceStatus,
        stubGetLicencesForStatus: licence.stubGetLicencesForStatus,
        stubGetCompletedLicence: licence.stubGetCompletedLicence,
        stubRecordAuditEvent: licence.stubRecordAuditEvent,
        stubCreateVariation: licence.stubCreateVariation,
        stubUpdateSpoDiscussion: licence.stubUpdateSpoDiscussion,
        stubUpdateVloDiscussion: licence.stubUpdateVloDiscussion,
        stubUpdateReasonForVariation: licence.stubUpdateReasonForVariation,
        stubGetLicenceVariationInProgress: licence.stubGetLicenceVariationInProgress,
        stubDiscardLicence: licence.stubDiscardLicence,
        stubUpdatePrisonInformation: licence.stubUpdatePrisonInformation,
        stubUpdateSentenceDates: licence.stubUpdateSentenceDates,
        stubMatchLicenceEvents: licence.stubMatchLicenceEvents,
        stubApproveVariation: licence.stubApproveVariation,
        stubReferVariation: licence.stubReferVariation,
        stubUpdateStandardConditions: licence.stubUpdateStandardConditions,
        stubGetHdcLicencesForOffender: licence.stubGetHdcLicencesForOffender,
        stubGetVariationsSubmittedByRegionForOffender: licence.stubGetVariationsSubmittedByRegionForOffender,
        stubGetLicencePolicyConditions: licence.stubGetLicencePolicyConditions,
        stubGetActivePolicyConditions: licence.stubGetActivePolicyConditions,
        stubGetPolicyChanges: licence.stubGetPolicyChanges,
        stubUpdateOffenderDetails: licence.stubUpdateOffenderDetails,
        stubGetBankHolidays: licence.stubGetBankHolidays,
        stubAddAdditionalCondition: licence.stubAddAdditionalCondition,

        stubGetPduHeads: community.stubGetPduHeads,
        stubGetStaffDetails: community.stubGetStaffDetails,
        stubGetStaffDetailsByStaffId: community.stubGetStaffDetailsByStaffId,
        stubGetStaffDetailsByStaffCode: community.stubGetStaffDetailsByStaffCode,
        stubGetStaffDetailsByList: community.stubGetStaffDetailsByList,
        stubGetManagedOffenders: community.stubGetManagedOffenders,
        stubGetAnOffendersManagers: community.stubGetAnOffendersManagers,
        stubGetUserDetailsByUsername: community.stubGetUserDetailsByUsername,
        stubAssignRole: community.stubAssignRole,
        stubGetSingleOffenderByCrn: community.stubGetSingleOffenderByCrn,

        searchPrisonersByNomisIds: prisonerSearch.searchPrisonersByNomisIds,
        searchPrisonersByBookingIds: prisonerSearch.searchPrisonersByBookingIds,
        searchPrisonersByReleaseDate: prisonerSearch.searchPrisonersByReleaseDate,

        stubGetPrisonUserDetails: prison.stubGetUserDetails,
        stubGetPrisonUserCaseloads: prison.stubGetUserCaseloads,
        stubGetPrisonerImage: prison.stubGetPrisonerImage,
        stubGetStaffDetailByUsername: community.stubGetStaffDetailByUsername,
        stubGetPrisonerDetail: prison.stubGetPrisonerDetail,
        stubGetPrisonerSentencesAndOffences: prison.stubGetPrisonerSentencesAndOffences,

        stubGetPrisonInformation: prison.stubGetPrisonInformation,
        stubGetHdcStatus: prison.stubGetHdcStatus,
        stubGetPrisons: prison.stubGetPrisons,

        stubGetProbationer: probationSearch.stubGetProbationer,
        stubGetOffendersByCrn: probationSearch.stubGetOffendersByCrn,
        stubGetOffendersByNomsNumber: probationSearch.stubGetOffendersByNomsNumber,

        stubGetProbationSearchResults: licence.stubSearchForOffenderOnStaffCaseload,

        sendDomainEvent: events.sendDomainEvent,
        sendPrisonEvent: events.sendPrisonEvent,
        sendProbationEvent: events.sendProbationEvent,
        purgeQueues: events.purgeQueues,
        getNextWorkingDay: (dates: string[]): Moment => {
          const appointmentDate = moment().add(1, 'year').add(1, 'week').day(7)
          while (
            appointmentDate.isoWeekday() === 6 ||
            appointmentDate.isoWeekday() === 7 ||
            dates.find(date => moment(date).isSame(appointmentDate, 'day')) !== undefined
          ) {
            appointmentDate.add(1, 'day')
          }
          return appointmentDate
        },
      })
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
  },
})
