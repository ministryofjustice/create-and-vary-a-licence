import { SQSMessage } from 'sqs-consumer'
import logger from '../../../../logger'

export default async function handleProbationEvents(messages: SQSMessage[]) {
  messages.forEach(message => {
    const deliusEvent = message.Body
    logger.info(`Delius Event : ${deliusEvent}`)

    // TODO: Handle OFFENDER_CHANGED event here. Offender may have changed in a few ways
    //  (i.e. offender manager may have changed, or just something small like CRN has changed)
  })
}
