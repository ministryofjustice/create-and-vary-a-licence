import { SQSMessage } from 'sqs-consumer'
import logger from '../../../../logger'
import { PrisonEvent } from '../../../@types/prisonApiClientTypes'

export default function buildEventHandler() {
  return async (messages: SQSMessage[]) => {
    messages.forEach(message => {
      const nomisEvent = JSON.parse(JSON.parse(message.Body).Message) as PrisonEvent
      logger.info(`Nomis Event : ${nomisEvent}`)
    })
  }
}
