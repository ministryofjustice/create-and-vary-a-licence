import { Message } from '@aws-sdk/client-sqs'
import logger from '../../../../logger'
import { Services } from '../../../services'
import { DomainEventMessage } from '../../../@types/events'
import ReleaseEventHandler from './releaseEventHandler'

export default function buildEventHandler({ licenceApiClient }: Services) {
  const releaseEventHandler = new ReleaseEventHandler(licenceApiClient)

  return async (messages: Message[]): Promise<Message[] | undefined> => {
    messages.forEach(message => {
      const event = JSON.parse(message.Body)

      const eventType = event.MessageAttributes.eventType.Value
      const eventMessage = JSON.parse(event.Message) as DomainEventMessage

      logger.info(`Domain Event (${eventType}) : ${JSON.stringify(eventMessage)}`)

      switch (eventType) {
        case 'prisoner-offender-search.prisoner.released':
          releaseEventHandler.handle(eventMessage).catch(error => logger.error(error))
          break
        default: {
          // silently ignore
        }
      }
    })
    return messages
  }
}
