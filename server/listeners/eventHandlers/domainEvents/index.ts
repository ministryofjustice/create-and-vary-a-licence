import { SQSMessage } from 'sqs-consumer'
import logger from '../../../../logger'
import { Services } from '../../../services'
import { DomainEventMessage } from '../../../@types/events'
import ReleaseEventHandler from './releaseEventHandler'
import TransferredEventHandler from './transferredEventHandler'

export default function buildEventHandler({ licenceService, prisonerService }: Services) {
  const releaseEventHandler = new ReleaseEventHandler(licenceService, prisonerService)
  const transferredEventHandler = new TransferredEventHandler(licenceService, prisonerService)

  return async (messages: SQSMessage[]) => {
    messages.forEach(message => {
      const prisonEvent = JSON.parse(message.Body)

      const eventType = prisonEvent.MessageAttributes.eventType.Value
      const eventMessage = JSON.parse(prisonEvent.Message) as DomainEventMessage

      logger.info(`Domain Event (${eventType}) : ${JSON.stringify(eventMessage)}`)

      switch (eventType) {
        case 'prison-offender-events.prisoner.released':
          releaseEventHandler.handle(eventMessage).catch(error => logger.error(error))
          break
        case 'prison-offender-events.prisoner.received':
          transferredEventHandler.handle(eventMessage).catch(error => logger.error(error))
          break
      }
    })
  }
}
