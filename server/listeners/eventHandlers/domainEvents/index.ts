import { Message } from '@aws-sdk/client-sqs'
import logger from '../../../../logger'
import { Services } from '../../../services'
import { DomainEventMessage } from '../../../@types/events'
import ReleaseEventHandler from './releaseEventHandler'
import TransferredEventHandler from './transferredEventHandler'

export default function buildEventHandler({ licenceService, prisonerService }: Services) {
  const releaseEventHandler = new ReleaseEventHandler(licenceService, prisonerService)
  const transferredEventHandler = new TransferredEventHandler(licenceService, prisonerService)

  return async (messages: Message[]) => {
    messages.forEach(message => {
      const event = JSON.parse(message.Body)

      const eventType = event.MessageAttributes.eventType.Value
      const eventMessage = JSON.parse(event.Message) as DomainEventMessage

      logger.info(`Domain Event (${eventType}) : ${JSON.stringify(eventMessage)}`)

      switch (eventType) {
        case 'prisoner-offender-search.prisoner.released':
          releaseEventHandler.handle(eventMessage).catch(error => logger.error(error))
          break
        case 'prison-offender-events.prisoner.received':
          transferredEventHandler.handle(eventMessage).catch(error => logger.error(error))
          break
        default: {
          // silently ignore
        }
      }
    })
  }
}
