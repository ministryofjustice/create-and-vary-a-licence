import { SQSMessage } from 'sqs-consumer'
import logger from '../../../../logger'

export default async function handlePrisonEvents(messages: SQSMessage[]) {
  messages.forEach(message => {
    const nomisEvent = message.Body
    logger.info(`Nomis Event : ${nomisEvent}`)

    // TODO: Check event type here and call out to an event handler based on event type
  })
}
