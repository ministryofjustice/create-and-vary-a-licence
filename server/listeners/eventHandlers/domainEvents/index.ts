import { SQSMessage } from 'sqs-consumer'
import logger from '../../../../logger'
import { Services } from '../../../services'
import { DomainEvent } from '../../../@types/domainEvent'
import ReleaseEventHandler from './releaseEventHandler'

export default function buildEventHandler({ licenceService }: Services) {
  const releaseEventHandler = new ReleaseEventHandler(licenceService)

  return async (messages: SQSMessage[]) => {
    messages.forEach(message => {
      logger.info(`Domain Event : ${message.Body}`)
      const domainEvent = JSON.parse(JSON.parse(message.Body).Message) as DomainEvent

      switch (domainEvent.eventType) {
        case 'prison-offender-events.prisoner.released':
          releaseEventHandler.handle(domainEvent)
      }
    })
  }
}
