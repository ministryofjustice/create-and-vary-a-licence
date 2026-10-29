context('Healthcheck', () => {
  context('All healthy', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubAll', [
        'stubAuthPing',
        'stubManageUsersPing',
        'stubTokenVerificationPing',
        'stubFeComponentsPing',
        'stubPrisonerSearchApiPing',
        'stubDeliusPing',
        'stubPrisonApiPing',
        'stubLicencesPing',
        'stubPrisonRegisterApiPing',
        'stubGotenbergApiPing',
      ])
    })

    it('Health check page is visible and UP', () => {
      cy.request('/health').its('body.status').should('equal', 'UP')
    })

    it('Ping is visible and UP', () => {
      cy.request('/ping').its('body.status').should('equal', 'UP')
    })

    it('Info is visible', () => {
      cy.request('/info').its('body').should('exist')
    })
  })

  context('Some unhealthy', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubAll', [
        'stubAuthPing',
        'stubManageUsersPing',
        ['stubTokenVerificationPing', 500],
        'stubFeComponentsPing',
        'stubPrisonerSearchApiPing',
        'stubDeliusPing',
        'stubPrisonApiPing',
        'stubLicencesPing',
        'stubPrisonRegisterApiPing',
        'stubGotenbergApiPing',
      ])
    })

    it('Reports correctly when token verification down', () => {
      cy.request({
        url: '/health',
        method: 'GET',
        failOnStatusCode: false,
      }).then(response => {
        expect(response.body.components.hmppsAuth.status).to.equal('UP')
        expect(response.body.components.manageUsersApi.status).to.equal('UP')
        expect(response.body.components.tokenVerification.status).to.equal('DOWN')
        expect(response.body.components.tokenVerification.details).to.contain({
          status: 500,
          attempts: 3,
        })
      })
    })

    it('Health check page is visible and DOWN', () => {
      cy.request({ url: '/health', method: 'GET', failOnStatusCode: false }).its('body.status').should('equal', 'DOWN')
    })
  })
})
