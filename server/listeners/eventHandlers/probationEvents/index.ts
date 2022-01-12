import { SQSMessage } from 'sqs-consumer'
import logger from '../../../../logger'

export default function buildEventHandler() {
  return async (messages: SQSMessage[]) => {
    messages.forEach(message => {
      logger.info(`Delius Event : ${message.Body}`)

      // TODO: Handle OFFENDER_CHANGED event here. Offender may have changed in a few ways
      //  (i.e. offender manager may have changed, or just something small like CRN has changed)
    })
  }
}
