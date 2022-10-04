import { initialiseAppInsights, buildAppInsightsClient, flush } from '../server/utils/azureAppInsights'
import LicenceApiClient from '../server/data/licenceApiClient'
import logger from '../logger'

initialiseAppInsights()
buildAppInsightsClient('create-and-vary-a-licence-email-probation-practioner-job')

const emailPpIfEditedLicencesNotApprovedByCrd = async (): Promise<void> => {
  const licenceApi = new LicenceApiClient()
  const editedLicencesUnapprovedByCrd = await licenceApi.getEditedLicencesUnapprovedByCrd()
  await licenceApi.notifyProbationPractionerOfEditedLicencesStillUnapprovedOnCrd(editedLicencesUnapprovedByCrd)
}

emailPpIfEditedLicencesNotApprovedByCrd()
  .then(() => {
    // Flush logs to app insights and only exit when complete
    flush({ callback: () => process.exit() }, 'success')
  })
  .catch((error: Error) => {
    logger.error(error, 'Problem occurred while emailing the probation practioner')
    flush({ callback: () => process.exit() }, 'failure')
  })
