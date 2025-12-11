import Page from './page'
import CaseloadPage from './caseload'
import ViewCasesPage from './viewCasesPage'
import { LicenceKind, LicenceStatus } from '../../server/enumeration'

export default class ConfirmationPage extends Page {
  private returnButtonId = '[data-qa=return-to-caselist]'

  private messageId = '#message'

  constructor() {
    super('confirmation-page')
  }

  clickReturn = (): CaseloadPage => {
    cy.task('stubGetLicencesForOffender', { nomisId: 'G9786GC', status: 'SUBMITTED' })
    cy.get(this.returnButtonId).click()
    return Page.verifyOnPage(CaseloadPage)
  }

  clickReturnToCaCaseload = (isUnallocatedCom?: boolean): ViewCasesPage => {
    cy.task('stubGetPrisonOmuCaseload', {
      licenceStatus: LicenceStatus.SUBMITTED,
      tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
      kind: LicenceKind.TIME_SERVED,
      hasNomisLicence: false,
      isUnallocatedCom: isUnallocatedCom || false,
    })
    cy.get(this.returnButtonId).click()
    return Page.verifyOnPage(ViewCasesPage)
  }

  clickReturnPss = (): CaseloadPage => {
    cy.task('stubGetPssLicencesForOffender', { nomisId: 'G9786GC', status: 'SUBMITTED' })
    cy.get(this.returnButtonId).click()
    return Page.verifyOnPage(CaseloadPage)
  }

  getApprovedMessage = () => cy.get(this.messageId)
}
