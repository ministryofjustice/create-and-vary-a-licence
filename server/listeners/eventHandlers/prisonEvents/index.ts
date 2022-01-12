import { SQSMessage } from 'sqs-consumer'
import logger from '../../../../logger'
import { PrisonEvent } from '../../../@types/prisonApiClientTypes'

export default function buildEventHandler() {
  return async (messages: SQSMessage[]) => {
    messages.forEach(message => {
      logger.info(`Nomis Event : ${message.Body}`)
      const nomisEvent = JSON.parse(JSON.parse(message.Body).Message) as PrisonEvent
    })
  }
}
