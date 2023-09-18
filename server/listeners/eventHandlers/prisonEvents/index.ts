import { SQSMessage } from 'sqs-consumer'
import logger from '../../../../logger'
import DatesChangedEventHandler from './datesChangedEventHandler'
import { Services } from '../../../services'
import { PrisonEventMessage } from '../../../@types/events'

export default function buildEventHandler({ licenceService, prisonerService }: Services) {
  const datesChangedEventHandler = new DatesChangedEventHandler(licenceService, prisonerService)

  return async (messages: SQSMessage[]) => {
    messages.forEach(message => {
      const prisonEvent = JSON.parse(message.Body)

      const eventType = prisonEvent.MessageAttributes.eventType.Value
      const eventMessage = JSON.parse(prisonEvent.Message) as PrisonEventMessage

      logger.info(`Prison Event (${eventType}) : ${JSON.stringify(eventMessage)}`)

      switch (eventType) {
        case 'SENTENCE_DATES-CHANGED':
        case 'CONFIRMED_RELEASE_DATE-CHANGED':
          datesChangedEventHandler.handle(eventMessage).catch(error => logger.error(error))
          break
        default: {
          // silently ignore
        }
      }
    })
  }
}
