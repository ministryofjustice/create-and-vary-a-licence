// TODO : change to a union type so we don't need the nullable fields.
// export type AuditPolicy = { audit: true; event: string } | { audit: false; reason: string }
export type AuditPolicy = {
  // Does the route need to be audited?
  audit: boolean

  // The audit event if the route is auditable
  event?: string

  // The reason why the route is not auditable, if applicable
  reason?: string

  // Set to true if the route is auditable but needs custom event data so will send the audit event itself
  customHandler?: boolean
}

/**
 * Every route in the application MUST have an entry here.
 * Entries must be explicit either audited with an event name, or explicitly excluded with justification.
 *
 * To add a new route:
 * 1. Add an entry with the HTTP method and route template (e.g., 'GET /licence/create/caseload')
 * 2. Set audit: true with an event name, or audit: false with a reason
 * 3. Run routeAuditPolicy.test.ts to verify all routes are correctly configured
 */
export const routeAuditPolicy: Record<string, AuditPolicy> = {
  // Home routes
  'GET /': {
    audit: false,
    reason: 'Home page user navigation, not auditable action',
  },
  'GET /contact': {
    audit: false,
    reason: 'Contact page static content, not auditable action',
  },
  'GET /accessibility-statement': {
    audit: false,
    reason: 'Accessibility statement static content, not auditable action',
    customHandler: true,
  },
  'GET /whats-new': {
    audit: false,
    reason: 'Whats new page static content, not auditable action',
  },
  'GET /:crn/restricted': {
    audit: true,
    event: 'VIEW_RESTRICTED_OFFENDER_DETAILS',
  },

  // Create licence routes
  'GET /licence/create/caseload': {
    audit: false,
    reason: 'Caseload list user navigation, not auditable action',
  },
  'GET /licence/create/probation-practitioner/staffCode/:staffCode': {
    audit: false,
    reason: 'Staff details lookup user navigation, not auditable action',
  },
  'GET /licence/create/nomisId/:nomisId/confirm': {
    audit: false,
    reason: 'Confirmation page pre-creation review, not auditable action',
  },
  'POST /licence/create/nomisId/:nomisId/confirm': {
    audit: true,
    event: 'CONFIRM_LICENCE_CREATION',
  },
  'GET /licence/create/id/:licenceId/additional-licence-conditions-question': {
    audit: false,
    reason: 'Form page user navigation, not auditable action',
  },
  'POST /licence/create/id/:licenceId/additional-licence-conditions-question': {
    audit: true,
    event: 'SELECT_ADDITIONAL_CONDITIONS',
  },
  'GET /licence/create/id/:licenceId/bespoke-conditions-question': {
    audit: false,
    reason: 'Form page user navigation, not auditable action',
  },
  'POST /licence/create/id/:licenceId/bespoke-conditions-question': {
    audit: true,
    event: 'SELECT_BESPOKE_CONDITIONS',
  },
  'GET /licence/create/id/:licenceId/check-your-answers': {
    audit: false,
    reason: 'Review page pre-submission review, not auditable action',
  },
  'POST /licence/create/id/:licenceId/check-your-answers': {
    audit: true,
    event: 'SUBMIT_LICENCE_CREATION',
  },
  'GET /licence/create/id/:licenceId/edit': {
    audit: false,
    reason: 'Edit page user navigation, not auditable action',
  },
  'POST /licence/create/id/:licenceId/edit': {
    audit: true,
    event: 'UPDATE_LICENCE_CREATION_ANSWER',
  },
  'GET /licence/create/id/:licenceId/confirmation': {
    audit: false,
    reason: 'Confirmation page post-submission message, not auditable action',
  },
  'GET /licence/create/nomisId/:nomisId/prison-will-create-this-licence': {
    audit: false,
    reason: 'Information page user notification, not auditable action',
  },
  'GET /licence/create/id/:licenceId/licence-created-by-prison': {
    audit: false,
    reason: 'Information page user notification, not auditable action',
  },
  'GET /licence/create/id/:licenceId/licence-changes-not-approved-in-time': {
    audit: false,
    reason: 'Information page user notification, not auditable action',
  },
  'GET /licence/hard-stop/create/nomisId/:nomisId/confirm': {
    audit: true,
    event: 'CONFIRM_LICENCE_CREATION_HARD_STOP',
  },
  'POST /licence/hard-stop/create/nomisId/:nomisId/confirm': {
    audit: true,
    event: 'SUBMIT_LICENCE_CREATION_HARD_STOP',
  },
  'GET /licence/create/id/:licenceId/opt-out-interrupt': {
    audit: true,
    event: 'OPT_OUT_OF_LICENCE_CREATION',
  },
  'GET /licence/hard-stop/create/nomisId/:nomisId/no-com-allocated': {
    audit: true,
    event: 'NO_COM_ALLOCATED_FOR_LICENCE_CREATION',
  },
  'GET /licence/hdc/create/nomisId/:nomisId/confirm': {
    audit: true,
    event: 'CONFIRM_LICENCE_CREATION_HDC',
  },
  'POST /licence/hdc/create/nomisId/:nomisId/confirm': {
    audit: true,
    event: 'SUBMIT_LICENCE_CREATION_HDC',
  },
  'GET /licence/create/id/:licenceId/additional-licence-conditions': {
    audit: true,
    event: 'VIEW_ADDITIONAL_CONDITIONS',
  },
  'POST /licence/create/id/:licenceId/additional-licence-conditions': {
    audit: true,
    event: 'SUBMIT_ADDITIONAL_CONDITIONS',
  },
  'GET /licence/create/id/:licenceId/additional-licence-conditions/callback': {
    audit: true,
    event: 'CALLBACK_ADDITIONAL_CONDITIONS',
  },
  'GET /licence/create/id/:licenceId/additional-licence-conditions/condition/:conditionId': {
    audit: true,
    event: 'VIEW_ADDITIONAL_CONDITION',
  },
  'POST /licence/create/id/:licenceId/additional-licence-conditions/condition/:conditionId': {
    audit: true,
    event: 'SUBMIT_ADDITIONAL_CONDITION',
  },
  'GET /licence/create/id/:licenceId/additional-licence-conditions/condition/:conditionId/delete': {
    audit: true,
    event: 'DELETE_ADDITIONAL_CONDITION',
  },
  'GET /licence/create/id/:licenceId/additional-licence-conditions/condition/:conditionId/skip': {
    audit: true,
    event: 'SKIP_ADDITIONAL_CONDITION',
  },
  'GET /licence/create/id/:licenceId/additional-licence-conditions/condition/code/:conditionCode/delete': {
    audit: true,
    event: 'DELETE_ADDITIONAL_CONDITION_BY_CODE',
  },
  'GET /licence/create/id/:licenceId/bespoke-conditions': {
    audit: true,
    event: 'VIEW_BESPOKE_CONDITIONS',
  },
  'POST /licence/create/id/:licenceId/bespoke-conditions': {
    audit: true,
    event: 'SUBMIT_BESPOKE_CONDITIONS',
  },
  'GET /licence/create/id/:licenceId/bespoke-conditions/delete': {
    audit: true,
    event: 'DELETE_BESPOKE_CONDITIONS',
  },
  'GET /licence/create/id/:licenceId/additional-licence-conditions/condition/:conditionCode/file-uploads': {
    audit: true,
    event: 'VIEW_ADDITIONAL_CONDITION_FILE_UPLOADS',
  },
  'POST /licence/create/id/:licenceId/additional-licence-conditions/condition/:conditionCode/file-uploads': {
    audit: true,
    event: 'SUBMIT_ADDITIONAL_CONDITION_FILE_UPLOADS',
  },
  'POST /licence/create/id/:licenceId/additional-licence-conditions/condition/:conditionId/file-upload-input': {
    audit: true,
    event: 'SUBMIT_ADDITIONAL_CONDITION_FILE_UPLOAD_INPUT',
  },
  'GET /licence/create/id/:licenceId/additional-licence-conditions/condition/:conditionId/file-upload-delete': {
    audit: true,
    event: 'DELETE_ADDITIONAL_CONDITION_FILE_UPLOAD',
  },
  'POST /licence/create/id/:licenceId/additional-licence-conditions/condition/:conditionId/file-upload': {
    audit: true,
    event: 'SUBMIT_ADDITIONAL_CONDITION_FILE_UPLOAD',
  },
  'GET /licence/create/id/:licenceId/additional-licence-conditions/condition/:conditionId/file-upload-removal': {
    audit: true,
    event: 'VIEW_ADDITIONAL_CONDITION_FILE_UPLOAD_REMOVAL',
  },
  'POST /licence/create/id/:licenceId/additional-licence-conditions/condition/:conditionId/file-upload-removal': {
    audit: true,
    event: 'SUBMIT_ADDITIONAL_CONDITION_FILE_UPLOAD_REMOVAL',
  },
  'GET /licence/create/id/:licenceId/additional-licence-conditions/condition/:conditionCode/outofbounds-premises': {
    audit: true,
    event: 'VIEW_ADDITIONAL_CONDITION_OUTOFBOUNDS_PREMISES',
  },
  'POST /licence/create/id/:licenceId/additional-licence-conditions/condition/:conditionCode/outofbounds-premises': {
    audit: true,
    event: 'SUBMIT_ADDITIONAL_CONDITION_OUTOFBOUNDS_PREMISES',
  },
  'POST /licence/create/id/:licenceId/additional-licence-conditions/condition/:conditionId/outofbounds-premises-input':
    {
      audit: true,
      event: 'SUBMIT_ADDITIONAL_CONDITION_OUTOFBOUNDS_PREMISES_INPUT',
    },
  'GET /licence/create/id/:licenceId/additional-licence-conditions/condition/:conditionId/outofbounds-premises-delete':
    {
      audit: true,
      event: 'VIEW_ADDITIONAL_CONDITION_OUTOFBOUNDS_PREMISES_DELETE',
    },
  'GET /licence/create/id/:licenceId/additional-licence-conditions/condition/:conditionId/outofbounds-premises-removal':
    {
      audit: true,
      event: 'VIEW_ADDITIONAL_CONDITION_OUTOFBOUNDS_PREMISES_REMOVAL',
    },
  'POST /licence/create/id/:licenceId/additional-licence-conditions/condition/:conditionId/outofbounds-premises-removal':
    {
      audit: true,
      event: 'SUBMIT_ADDITIONAL_CONDITION_OUTOFBOUNDS_PREMISES_REMOVAL',
    },
  'GET /licence/create/id/:licenceId/additional-licence-conditions/condition/:conditionCode/curfew': {
    audit: true,
    event: 'VIEW_ADDITIONAL_CONDITION_CURFEW',
  },
  'POST /licence/create/id/:licenceId/additional-licence-conditions/condition/:conditionCode/curfew': {
    audit: true,
    event: 'SUBMIT_ADDITIONAL_CONDITION_CURFEW',
  },
  'GET /licence/vary/caseload': {
    audit: true,
    event: 'VIEW_CASELOAD',
  },
  'GET /licence/vary/id/:licenceId/probation-practitioner': {
    audit: true,
    event: 'VIEW_PROBATION_PRACTITIONER_DETAILS',
  },
  'GET /licence/vary/id/:licenceId/timeline': {
    audit: true,
    event: 'VIEW_TIMELINE',
  },
  'POST /licence/vary/id/:licenceId/timeline': {
    audit: true,
    event: 'SUBMIT_TIMELINE_COMMENT',
  },
  'GET /licence/vary/id/:licenceId/view': {
    audit: true,
    event: 'VIEW_VARIATION',
  },
  'GET /licence/vary/id/:licenceId/view-active': {
    audit: true,
    event: 'VIEW_ACTIVE_VARIATION',
  },
  'GET /licence/vary/id/:licenceId/confirm-vary-action': {
    audit: true,
    event: 'VIEW_CONFIRM_VARY_ACTION',
  },
  'POST /licence/vary/id/:licenceId/confirm-vary-action': {
    audit: true,
    event: 'SUBMIT_CONFIRM_VARY_ACTION',
  },
  'GET /licence/vary/id/:licenceId/spo-discussion': {
    audit: true,
    event: 'VIEW_SPO_DISCUSSION',
  },
  'POST /licence/vary/id/:licenceId/spo-discussion': {
    audit: true,
    event: 'SUBMIT_SPO_DISCUSSION',
  },
  'GET /licence/vary/id/:licenceId/vlo-discussion': {
    audit: true,
    event: 'VIEW_VLO_DISCUSSION',
  },
  'POST /licence/vary/id/:licenceId/vlo-discussion': {
    audit: true,
    event: 'SUBMIT_VLO_DISCUSSION',
  },
  'GET /licence/vary/id/:licenceId/confirm-amend-variation': {
    audit: true,
    event: 'VIEW_CONFIRM_AMEND_VARIATION',
  },
  'POST /licence/vary/id/:licenceId/confirm-amend-variation': {
    audit: true,
    event: 'SUBMIT_CONFIRM_AMEND_VARIATION',
  },
  'GET /licence/vary/id/:licenceId/confirm-discard-variation': {
    audit: true,
    event: 'VIEW_CONFIRM_DISCARD_VARIATION',
  },
  'POST /licence/vary/id/:licenceId/confirm-discard-variation': {
    audit: true,
    event: 'SUBMIT_CONFIRM_DISCARD_VARIATION',
  },
  'GET /licence/vary/id/:licenceId/have-you-reviewed-this-licence': {
    audit: true,
    event: 'VIEW_HAVE_YOU_REVIEWED_THIS_LICENCE',
  },
  'POST /licence/vary/id/:licenceId/have-you-reviewed-this-licence': {
    audit: true,
    event: 'SUBMIT_HAVE_YOU_REVIEWED_THIS_LICENCE',
  },
  'GET /licence/vary/id/:licenceId/reason-for-variation': {
    audit: true,
    event: 'VIEW_REASON_FOR_VARIATION',
  },
  'POST /licence/vary/id/:licenceId/reason-for-variation': {
    audit: true,
    event: 'SUBMIT_REASON_FOR_VARIATION',
  },
  'GET /licence/vary/id/:licenceId/summary': {
    audit: true,
    event: 'VIEW_SUMMARY',
  },
  'POST /licence/vary/id/:licenceId/summary': {
    audit: true,
    event: 'SUBMIT_SUMMARY',
  },
  'GET /licence/vary/id/:licenceId/confirmation': {
    audit: true,
    event: 'VIEW_CONFIRMATION',
  },
  'GET /licence/vary/id/:licenceId/policy-changes': {
    audit: true,
    event: 'VIEW_POLICY_CHANGES',
  },
  'POST /licence/vary/id/:licenceId/policy-changes': {
    audit: true,
    event: 'SUBMIT_POLICY_CHANGES',
  },
  'GET /licence/vary/id/:licenceId/policy-changes/callback': {
    audit: true,
    event: 'VIEW_POLICY_CHANGES_CALLBACK',
  },
  'GET /licence/vary/id/:licenceId/policy-changes/condition/:changeCounter': {
    audit: true,
    event: 'VIEW_POLICY_CHANGE_CONDITION',
  },
  'POST /licence/vary/id/:licenceId/policy-changes/condition/:changeCounter': {
    audit: true,
    event: 'SUBMIT_POLICY_CHANGE_CONDITION',
  },
  'POST /licence/vary/id/:licenceId/policy-changes/condition/:changeCounter/delete': {
    audit: true,
    event: 'SUBMIT_POLICY_CHANGE_CONDITION_DELETE',
  },
  'GET /licence/vary/id/:licenceId/policy-changes/condition/:changeCounter/delete': {
    audit: true,
    event: 'VIEW_POLICY_CHANGE_CONDITION_DELETE',
  },
  'GET /licence/vary/id/:licenceId/policy-changes/input/callback/:changeCounter': {
    audit: true,
    event: 'VIEW_POLICY_CHANGE_INPUT_CALLBACK',
  },
  'GET /licence/vary/id/:licenceId/other-agencies': {
    audit: true,
    event: 'VIEW_OTHER_AGENCIES',
  },
  'GET /licence/vary/id/:licenceId/hdc/accommodation-type-question': {
    audit: true,
    event: 'VIEW_HDC_ACCOMMODATION_TYPE_QUESTION',
  },
  'POST /licence/vary/id/:licenceId/hdc/accommodation-type-question': {
    audit: true,
    event: 'SUBMIT_HDC_ACCOMMODATION_TYPE_QUESTION',
  },
  'GET /licence/vary/id/:licenceId/hdc/address-checks': {
    audit: true,
    event: 'VIEW_HDC_ADDRESS_CHECKS',
  },
  'POST /licence/vary/id/:licenceId/hdc/address-checks': {
    audit: true,
    event: 'SUBMIT_HDC_ADDRESS_CHECKS',
  },
  'GET /licence/vary/id/:licenceId/hdc/residential-checks-incomplete': {
    audit: true,
    event: 'VIEW_HDC_RESIDENTIAL_CHECKS_INCOMPLETE',
  },
  'POST /licence/vary/id/:licenceId/hdc/residential-checks-incomplete': {
    audit: true,
    event: 'SUBMIT_HDC_RESIDENTIAL_CHECKS_INCOMPLETE',
  },
  'GET /licence/vary/id/:licenceId/hdc/find-the-new-curfew-address': {
    audit: true,
    event: 'VIEW_HDC_FIND_NEW_CURFEW_ADDRESS',
  },
  'POST /licence/vary/id/:licenceId/hdc/find-the-new-curfew-address': {
    audit: true,
    event: 'SUBMIT_HDC_FIND_NEW_CURFEW_ADDRESS',
  },
  'GET /licence/vary/id/:licenceId/hdc/no-curfew-address-found': {
    audit: true,
    event: 'VIEW_HDC_NO_CURFEW_ADDRESS_FOUND',
  },
  'GET /licence/vary/id/:licenceId/hdc/select-curfew-address': {
    audit: true,
    event: 'VIEW_HDC_SELECT_CURFEW_ADDRESS',
  },
  'POST /licence/vary/id/:licenceId/hdc/select-curfew-address': {
    audit: true,
    event: 'SUBMIT_HDC_SELECT_CURFEW_ADDRESS',
  },
  'GET /licence/vary/id/:licenceId/hdc/manual-curfew-address-entry': {
    audit: true,
    event: 'VIEW_HDC_MANUAL_CURFEW_ADDRESS_ENTRY',
  },
  'POST /licence/vary/id/:licenceId/hdc/manual-curfew-address-entry': {
    audit: true,
    event: 'SUBMIT_HDC_MANUAL_CURFEW_ADDRESS_ENTRY',
  },
  'GET /licence/vary/id/:licenceId/hdc/standard-curfew-hours-question': {
    audit: true,
    event: 'VIEW_HDC_STANDARD_CURFEW_HOURS_QUESTION',
  },
  'POST /licence/vary/id/:licenceId/hdc/standard-curfew-hours-question': {
    audit: true,
    event: 'SUBMIT_HDC_STANDARD_CURFEW_HOURS_QUESTION',
  },
  'GET /licence/vary/id/:licenceId/hdc/do-hdc-curfew-hours-apply-daily': {
    audit: true,
    event: 'VIEW_HDC_CURFEW_HOURS_APPLY_DAILY',
  },
  'POST /licence/vary/id/:licenceId/hdc/do-hdc-curfew-hours-apply-daily': {
    audit: true,
    event: 'SUBMIT_HDC_CURFEW_HOURS_APPLY_DAILY',
  },
  'GET /licence/vary/id/:licenceId/hdc/individual-curfew-hours': {
    audit: true,
    event: 'VIEW_HDC_INDIVIDUAL_CURFEW_HOURS',
  },
  'POST /licence/vary/id/:licenceId/hdc/individual-curfew-hours': {
    audit: true,
    event: 'SUBMIT_HDC_INDIVIDUAL_CURFEW_HOURS',
  },
  'GET /licence/vary/id/:licenceId/hdc/curfew-hours': { audit: true, event: 'VIEW_HDC_CURFEW_HOURS' },
  'POST /licence/vary/id/:licenceId/hdc/curfew-hours': { audit: true, event: 'SUBMIT_HDC_CURFEW_HOURS' },
  'GET /licence/approve/cases': { audit: true, event: 'VIEW_LICENCE_APPROVE_CASES' },
  'GET /licence/approve/id/:licenceId/probation-practitioner': {
    audit: true,
    event: 'VIEW_LICENCE_APPROVE_PROBATION_PRACTITIONER',
  },
  'GET /licence/approve/id/:licenceId/view': { audit: true, event: 'VIEW_LICENCE_APPROVE' },
  'POST /licence/approve/id/:licenceId/view': { audit: true, event: 'SUBMIT_LICENCE_APPROVE' },
  'GET /licence/approve/id/:licenceId/confirm-approved': {
    audit: true,
    event: 'VIEW_LICENCE_APPROVE_CONFIRM_APPROVED',
  },
  'GET /licence/view/cases': { audit: true, event: 'VIEW_LICENCE_VIEW_CASES' },
  'GET /licence/view/probation-practitioner/staffCode/:staffCode': {
    audit: true,
    event: 'VIEW_LICENCE_VIEW_PROBATION_PRACTITIONER',
  },
  'GET /licence/view/id/:licenceId/show': { audit: true, event: 'VIEW_LICENCE_VIEW' },
  'GET /licence/view/id/:licenceId/crds-click': { audit: true, event: 'VIEW_LICENCE_VIEW_CRDS_CLICK' },
  'GET /licence/view/id/:licenceId/html-print': { audit: true, event: 'VIEW_LICENCE_VIEW_HTML_PRINT' },
  'GET /licence/view/id/:licenceId/pdf-print': { audit: true, event: 'VIEW_LICENCE_VIEW_PDF_PRINT' },
  'GET /licence/vary-approve/list': { audit: true, event: 'VIEW_LICENCE_VARY_APPROVE_LIST' },
  'GET /licence/vary-approve/id/:licenceId/view': { audit: true, event: 'VIEW_LICENCE_VARY_APPROVE' },
  'POST /licence/vary-approve/id/:licenceId/view': { audit: true, event: 'SUBMIT_LICENCE_VARY_APPROVE' },
  'GET /licence/vary-approve/id/:licenceId/approve': { audit: true, event: 'VIEW_LICENCE_VARY_APPROVE_APPROVE' },
  'GET /licence/vary-approve/id/:licenceId/refer': { audit: true, event: 'VIEW_LICENCE_VARY_APPROVE_REFER' },
  'POST /licence/vary-approve/id/:licenceId/refer': { audit: true, event: 'SUBMIT_LICENCE_VARY_APPROVE_REFER' },
  'GET /licence/vary-approve/id/:licenceId/refer-confirm': {
    audit: true,
    event: 'VIEW_LICENCE_VARY_APPROVE_REFER_CONFIRM',
  },
  'GET /licence/vary-approve/id/:licenceId/probation-practitioner': {
    audit: true,
    event: 'VIEW_LICENCE_VARY_APPROVE_PROBATION_PRACTITIONER',
  },
  'GET /support/': { audit: true, event: 'VIEW_SUPPORT' },
  'GET /support/manage-omu-email-address': { audit: true, event: 'VIEW_MANAGE_OMU_EMAIL_ADDRESS' },
  'GET /support/manage-omu-email-address/:prisonId': { audit: true, event: 'VIEW_MANAGE_OMU_EMAIL_ADDRESS_PRISON' },
  'POST /support/manage-omu-email-address/add-or-edit': {
    audit: true,
    event: 'SUBMIT_MANAGE_OMU_EMAIL_ADDRESS_ADD_OR_EDIT',
  },
  'POST /support/manage-omu-email-address/delete': { audit: true, event: 'SUBMIT_MANAGE_OMU_EMAIL_ADDRESS_DELETE' },
  'POST /support/manage-omu-email-address': { audit: true, event: 'SUBMIT_MANAGE_OMU_EMAIL_ADDRESS' },
  'GET /support/probation-teams/:teamCode/caseload': { audit: true, event: 'VIEW_PROBATION_TEAM_CASELOAD' },
  'GET /support/probation-practitioner/:staffCode': { audit: true, event: 'VIEW_PROBATION_PRACTITIONER_DETAILS' },
  'GET /support/probation-practitioner/:staffCode/caseload': {
    audit: true,
    event: 'VIEW_PROBATION_PRACTITIONER_CASELOAD',
  },
  'GET /support/offender-search': { audit: true, event: 'VIEW_OFFENDER_SEARCH' },
  'GET /support/offender/:nomsId/detail': { audit: true, event: 'VIEW_OFFENDER_DETAIL' },
  'GET /support/offender/:nomsId/licences': { audit: true, event: 'VIEW_OFFENDER_LICENCES' },

  // Custom handlers
  'GET /search/probation-search': { audit: true, customHandler: true },

  // Framework/system routes (excluded by design)
  'GET /health': {
    audit: false,
    reason: 'Health check endpoint system monitoring, not auditable action',
  },
  'GET /info': {
    audit: false,
    reason: 'Application info endpoint system monitoring, not auditable action',
  },
  'GET /ping': {
    audit: false,
    reason: 'Ping endpoint system monitoring, not auditable action',
  },
  'GET /autherror': {
    audit: false,
    reason: 'Authentication error page system response, not auditable action',
  },
  'GET /access-denied': {
    audit: false,
    reason: 'Access denied page system response, not auditable action',
  },
  'GET /login': {
    audit: false,
    reason: 'OAuth2 login redirect authentication flow, not auditable action',
  },
  'GET /login/callback': {
    audit: false,
    reason: 'OAuth2 callback—authentication flow, not auditable action',
  },
  'GET /sign-out': {
    audit: false,
    reason: 'Sign out—authentication flow, not auditable action',
  },
} as const satisfies Record<string, AuditPolicy>

export type AuditRouteKey = keyof typeof routeAuditPolicy
