import { SQSMessage } from 'sqs-consumer'
import logger from '../../../../logger'
import { ProbationEvent } from '../../../@types/events'
import OffenderManagerChangedEventHandler from './offenderManagerChangedEventHandler'
import { Services } from '../../../services'

export default function buildEventHandler({ communityService, licenceService }: Services) {
  const offenderManagerChangedHandler = new OffenderManagerChangedEventHandler(communityService, licenceService)

  return async (messages: SQSMessage[]) => {
    messages.forEach(message => {
      const probationEvent = JSON.parse(JSON.parse(message.Body).Message) as ProbationEvent
      logger.info(`Probation Event : ${JSON.stringify(probationEvent)}`)

      switch (probationEvent.eventType) {
        case 'OFFENDER_MANAGER_CHANGED':
          offenderManagerChangedHandler.handle(probationEvent).catch(error => logger.error(error))
      }
    })
  }
}
