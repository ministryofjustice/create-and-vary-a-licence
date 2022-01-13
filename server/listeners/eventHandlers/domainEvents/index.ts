import { SQSMessage } from 'sqs-consumer'
import logger from '../../../../logger'
import { Services } from '../../../services'
import { DomainEvent } from '../../../@types/domainEvent'
import ReleaseEventHandler from './releaseEventHandler'

export default function buildEventHandler({ licenceService }: Services) {
  const releaseEventHandler = new ReleaseEventHandler(licenceService)

  return async (messages: SQSMessage[]) => {
    messages.forEach(message => {
      const domainEvent = JSON.parse(JSON.parse(message.Body).Message) as DomainEvent
      logger.info(`Domain Event : ${JSON.stringify(domainEvent)}`)

      switch (domainEvent.eventType) {
        case 'prison-offender-events.prisoner.released':
          releaseEventHandler.handle(domainEvent).catch(error => logger.error(error))
      }
    })
  }
}
