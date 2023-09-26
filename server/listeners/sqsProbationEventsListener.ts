import { SQSClient } from '@aws-sdk/client-sqs'
import { Consumer } from 'sqs-consumer'
import config from '../config'
import logger from '../../logger'
import buildEventHandler from './eventHandlers/probationEvents'
import { Services } from '../services'

const sqs = new SQSClient({
  region: 'eu-west-2',
  endpoint: config.sqs.endpoint,
})

export default function createSqsListener(services: Services) {
  const app = Consumer.create({
    queueUrl: config.sqs.probationEvents.queueUrl,
    handleMessageBatch: buildEventHandler(services),
    sqs,
    pollingWaitTimeMs: config.sqs.pollingWaitTimeMs,
    batchSize: 10,
  })

  logger.info(`Consuming from queue ${config.sqs.probationEvents.queueUrl}`)

  app.on('error', err => {
    logger.error(err.message)
  })

  app.on('processing_error', err => {
    logger.error(err.message)
  })

  return {
    app,
  }
}
