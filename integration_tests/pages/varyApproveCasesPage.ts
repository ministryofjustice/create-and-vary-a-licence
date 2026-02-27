import Page from './page'
import VaryApproveSearchPage from './varyApproveSearchPage'
import VaryApproveViewPage from './varyApproveViewPage'
import RestrictedDetailsPage from './restrictedDetails'

export default class VaryApproveCasesPage extends Page {
  private varyApproveLinkId = '#name-link-1'

  private restrictedLinkId = '#name-link-3'

  private allRegionsId = '#allRegions'

  private searchTextInput = '#search'

  private searchButtonId = '[data-qa=search-button]'

  private variationRequestDate = '[data-qa=variationRequestDate]'

  constructor() {
    super('vary-approval-cases-page')
  }

  clickSearch = (text: string): VaryApproveSearchPage => {
    cy.get(this.searchTextInput).type(text)
    cy.get(this.searchButtonId).click()
    return Page.verifyOnPage(VaryApproveSearchPage)
  }

  selectCase = (): VaryApproveViewPage => {
    cy.get(this.varyApproveLinkId).click()
    return Page.verifyOnPage(VaryApproveViewPage)
  }

  clickViewAllRegions = (): VaryApproveCasesPage => {
    cy.get(this.allRegionsId).click()
    return Page.verifyOnPage(VaryApproveCasesPage)
  }

  getVariationRequestDate = n => {
    return cy.get(this.variationRequestDate).eq(n)
  }

  getRow = (n: number) => {
    return cy.get('tbody tr').eq(n)
  }

  clickRestrictedOffenderName = (): RestrictedDetailsPage => {
    cy.get(this.restrictedLinkId).click()
    return Page.verifyOnPage(RestrictedDetailsPage)
  }
}
