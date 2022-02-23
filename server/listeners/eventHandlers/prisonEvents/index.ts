import { SQSMessage } from 'sqs-consumer'
import logger from '../../../../logger'
import { PrisonEvent } from '../../../@types/prisonApiClientTypes'
import SentenceDatesChangedEventHandler from './sentenceDatesChangedEventHandler'
import { Services } from '../../../services'

export default function buildEventHandler({ licenceService, prisonerService }: Services) {
  const sentenceDatesChangedEventHandler = new SentenceDatesChangedEventHandler(licenceService, prisonerService)

  return async (messages: SQSMessage[]) => {
    messages.forEach(message => {
      const nomisEvent = JSON.parse(JSON.parse(message.Body).Message) as PrisonEvent
      logger.info(`Nomis Event : ${JSON.stringify(nomisEvent)}`)

      switch (nomisEvent.eventType) {
        case 'SENTENCE_DATES-CHANGED':
          sentenceDatesChangedEventHandler.handle(nomisEvent).catch(error => logger.error(error))
          break
      }
    })
  }
}
