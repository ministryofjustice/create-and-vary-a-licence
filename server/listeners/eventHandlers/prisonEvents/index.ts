import { SQSMessage } from 'sqs-consumer'
import logger from '../../../../logger'
import { PrisonEventMessage } from '../../../@types/prisonApiClientTypes'
import DatesChangedEventHandler from './datesChangedEventHandler'
import { Services } from '../../../services'
import OffenderDetailsChangedEventHandler from './offenderDetailsChangedEventHandler'

export default function buildEventHandler({ licenceService, prisonerService }: Services) {
  const datesChangedEventHandler = new DatesChangedEventHandler(licenceService, prisonerService)
  const offenderDetailsChangedEventHandler = new OffenderDetailsChangedEventHandler(licenceService, prisonerService)

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
        case 'OFFENDER-UPDATED':
        case 'OFFENDER_DETAILS-CHANGED':
          offenderDetailsChangedEventHandler.handle(eventMessage).catch(error => logger.error(error))
          break
      }
    })
  }
}
