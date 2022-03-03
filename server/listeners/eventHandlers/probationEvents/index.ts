import { SQSMessage } from 'sqs-consumer'
import logger from '../../../../logger'
import { ProbationEventMessage } from '../../../@types/events'
import OffenderManagerChangedEventHandler from './offenderManagerChangedEventHandler'
import { Services } from '../../../services'

export default function buildEventHandler({ communityService, licenceService }: Services) {
  const offenderManagerChangedHandler = new OffenderManagerChangedEventHandler(communityService, licenceService)

  return async (messages: SQSMessage[]) => {
    messages.forEach(message => {
      const probationEvent = JSON.parse(message.Body)

      const eventType = probationEvent.MessageAttributes.eventType.Value
      const eventMessage = JSON.parse(probationEvent.Message) as ProbationEventMessage

      logger.info(`Probation Event (${eventType}) : ${JSON.stringify(eventMessage)}`)

      switch (eventType) {
        case 'OFFENDER_MANAGER_CHANGED':
          offenderManagerChangedHandler.handle(eventMessage).catch(error => logger.error(error))
      }
    })
  }
}
