import { Message } from '@aws-sdk/client-sqs'
import logger from '../../../../logger'
import { Services } from '../../../services'
import { DomainEventMessage } from '../../../@types/events'
import ReleaseEventHandler from './releaseEventHandler'
import TransferredEventHandler from './transferredEventHandler'
import OffenderDetailsChangedEventHandler from './offenderDetailsChangedEventHandler'

export default function buildEventHandler({ licenceService, prisonerService }: Services) {
  const releaseEventHandler = new ReleaseEventHandler(licenceService, prisonerService)
  const transferredEventHandler = new TransferredEventHandler(licenceService, prisonerService)
  const offenderDetailsChangedEventHandler = new OffenderDetailsChangedEventHandler(licenceService, prisonerService)

  return async (messages: Message[]) => {
    messages.forEach(message => {
      const event = JSON.parse(message.Body)

      const eventType = event.MessageAttributes.eventType.Value
      const eventMessage = JSON.parse(event.Message) as DomainEventMessage

      logger.info(`Domain Event (${eventType}) : ${JSON.stringify(eventMessage)}`)

      switch (eventType) {
        case 'prison-offender-events.prisoner.released':
          releaseEventHandler.handle(eventMessage).catch(error => logger.error(error))
          break
        case 'prison-offender-events.prisoner.received':
          transferredEventHandler.handle(eventMessage).catch(error => logger.error(error))
          break
        case 'prisoner-offender-search.prisoner.updated':
          if (eventMessage.additionalInformation?.categoriesChanged?.includes('PERSONAL_DETAILS')) {
            offenderDetailsChangedEventHandler.handle(eventMessage).catch(error => logger.error(error))
          }
          break
        default: {
          // silently ignore
        }
      }
    })
  }
}
