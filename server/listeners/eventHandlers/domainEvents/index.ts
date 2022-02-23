import { SQSMessage } from 'sqs-consumer'
import logger from '../../../../logger'
import { Services } from '../../../services'
import { DomainEvent } from '../../../@types/events'
import ReleaseEventHandler from './releaseEventHandler'
import TransferredEventHandler from './transferredEventHandler'

export default function buildEventHandler({ licenceService, prisonerService }: Services) {
  const releaseEventHandler = new ReleaseEventHandler(licenceService)
  const transferredEventHandler = new TransferredEventHandler(licenceService, prisonerService)

  return async (messages: SQSMessage[]) => {
    messages.forEach(message => {
      const domainEvent = JSON.parse(JSON.parse(message.Body).Message) as DomainEvent
      logger.info(`Domain Event : ${JSON.stringify(domainEvent)}`)

      switch (domainEvent.eventType) {
        case 'prison-offender-events.prisoner.released':
          releaseEventHandler.handle(domainEvent).catch(error => logger.error(error))
          break
        case 'prison-offender-events.prisoner.received':
          transferredEventHandler.handle(domainEvent).catch(error => logger.error(error))
          break
      }
    })
  }
}
