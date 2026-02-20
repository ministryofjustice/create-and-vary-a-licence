enum LicenceStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  INACTIVE = 'INACTIVE',
  RECALLED = 'RECALLED',
  APPROVED = 'APPROVED',
  NOT_STARTED = 'NOT_STARTED',
  VARIATION_IN_PROGRESS = 'VARIATION_IN_PROGRESS',
  VARIATION_SUBMITTED = 'VARIATION_SUBMITTED',
  VARIATION_REJECTED = 'VARIATION_REJECTED',
  VARIATION_APPROVED = 'VARIATION_APPROVED',
  NOT_IN_PILOT = 'NOT_IN_PILOT',
  OOS_BOTUS = 'OOS_BOTUS',
  OOS_RECALL = 'OOS_RECALL',
  TIMED_OUT = 'TIMED_OUT',
  REVIEW_NEEDED = 'REVIEW_NEEDED',
  NOMIS_LICENCE = 'NOMIS_LICENCE',
}

const selectableLicenceStatus = Object.values(LicenceStatus).filter(
  s =>
    ![
      LicenceStatus.OOS_BOTUS,
      LicenceStatus.OOS_RECALL,
      LicenceStatus.NOT_IN_PILOT,
      LicenceStatus.NOT_IN_PILOT,
    ].includes(s),
)

export default LicenceStatus
export { selectableLicenceStatus }
