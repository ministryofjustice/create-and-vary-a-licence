import { SQSMessage } from 'sqs-consumer'
import logger from '../../../../logger'
import { Services } from '../../../services'

export default function buildEventHandler({ licenceService }: Services) {
  return async (messages: SQSMessage[]) => {
    messages.forEach(message => {
      const domainEvent = message.Body
      logger.info(`Domain Event : ${domainEvent}`)

      // TODO: Handle domain events event here.
    })
  }
}
