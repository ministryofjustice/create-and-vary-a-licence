import { SQSMessage } from 'sqs-consumer'
import logger from '../../../../logger'
import { PrisonEventMessage } from '../../../@types/prisonApiClientTypes'
import SentenceDatesChangedEventHandler from './sentenceDatesChangedEventHandler'
import { Services } from '../../../services'

export default function buildEventHandler({ licenceService, prisonerService }: Services) {
  const sentenceDatesChangedEventHandler = new SentenceDatesChangedEventHandler(licenceService, prisonerService)

  return async (messages: SQSMessage[]) => {
    messages.forEach(message => {
      const prisonEvent = JSON.parse(message.Body)

      const eventType = prisonEvent.MessageAttributes.eventType.Value
      const eventMessage = JSON.parse(prisonEvent.Message) as PrisonEventMessage

      logger.info(`Prison Event (${eventType}) : ${JSON.stringify(eventMessage)}`)

      switch (eventType) {
        case 'SENTENCE_DATES-CHANGED':
          sentenceDatesChangedEventHandler.handle(eventMessage).catch(error => logger.error(error))
          break
      }
    })
  }
}
