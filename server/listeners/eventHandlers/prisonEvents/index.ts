import { SQSMessage } from 'sqs-consumer'
import logger from '../../../../logger'
import { Services } from '../../../services'
import ExternalMovementRecordInsertedHandler from './externalMovementRecordInsertedHandler'
import { PrisonEvent } from '../../../@types/prisonApiClientTypes'

export default function buildEventHandler({ licenceService }: Services) {
  const externalMovementRecordInsertedHandler = new ExternalMovementRecordInsertedHandler(licenceService)

  return async (messages: SQSMessage[]) => {
    messages.forEach(message => {
      const nomisEvent = JSON.parse(JSON.parse(message.Body).Message) as PrisonEvent
      logger.info(`Nomis Event : ${nomisEvent}`)

      switch (nomisEvent.eventType) {
        case 'EXTERNAL_MOVEMENT_RECORD-INSERTED':
          externalMovementRecordInsertedHandler.handle(nomisEvent)
      }
    })
  }
}
