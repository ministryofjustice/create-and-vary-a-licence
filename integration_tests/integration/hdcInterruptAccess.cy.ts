context('HDC interrupt user access', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAll', [
      'stubGetStaffDetails',
      'stubCheckComCaseAccess',
      'stubGetPrisonUserDetails',
      'stubGetOmuEmail',
      ['stubGetBankHolidays', []],
      [
        'stubGetHdcLicence',
        {
          kind: 'HDC',
          statusCode: 'IN_PROGRESS',
          isReplacementForOptedInLicence: true,
          hdcRiskChecksComplete: false,
        },
      ],
    ])
  })

  const comRoles = [['ROLE_LICENCE_RO'], ['ROLE_LICENCE_RO', 'ROLE_LICENCE_ACO']]
  comRoles.forEach(roles => {
    it(`denies direct navigation for a COM with roles ${roles.join(', ')} on shared appointment pages`, () => {
      cy.task('stubProbationSignIn', roles)
      cy.signIn()

      cy.visit('/licence/create/id/1/initial-meeting-name', { failOnStatusCode: false })

      cy.location('pathname').should('eq', '/access-denied')
      cy.get('#access-denied-page').should('exist')
    })
  })

  it('does not interrupt a probation user without the COM role on a shared appointment page', () => {
    cy.task('stubProbationSignIn', ['ROLE_LICENCE_CA'])
    cy.signIn()

    cy.visit('/licence/create/id/1/initial-meeting-name')

    cy.location('pathname').should('eq', '/licence/create/id/1/initial-meeting-name')
    cy.contains('h1', 'Who is the initial appointment with?').should('be.visible')
    cy.get('#hdc-opt-in-interrupt-page-heading').should('not.exist')
  })

  it('does not interrupt a prison user updating initial appointment details', () => {
    cy.task('stubPrisonSignIn')
    cy.task('stubGetHdcLicence', {
      kind: 'HDC',
      statusCode: 'IN_PROGRESS',
      isReplacementForOptedInLicence: true,
      hdcRiskChecksComplete: false,
      isInHardStopPeriod: true,
    })
    cy.task('stubGetPrisonUserCaseloads', {
      details: [
        {
          caseLoadId: 'LEI',
          caseloadFunction: 'GENERAL',
          currentlyActive: true,
          description: 'Leeds (HMP)',
          type: 'INST',
        },
      ],
    })
    cy.signIn()

    cy.visit('/licence/view/id/1/initial-meeting-name')

    cy.location('pathname').should('eq', '/licence/view/id/1/initial-meeting-name')
    cy.contains('h1', 'Who is the initial appointment with?').should('be.visible')
    cy.get('#hdc-opt-in-interrupt-page-heading').should('not.exist')
  })
})
