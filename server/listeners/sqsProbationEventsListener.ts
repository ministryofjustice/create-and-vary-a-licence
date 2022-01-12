import AWS from 'aws-sdk'
import { Consumer } from 'sqs-consumer'
import config from '../config'
import logger from '../../logger'
import buildEventHandler from './eventHandlers/probationEvents'

const sqs = new AWS.SQS({
  region: 'eu-west-2',
  accessKeyId: config.sqs.probationEvents.accessKeyId,
  secretAccessKey: config.sqs.probationEvents.secretAccessKey,
})

export default function createSqsListener() {
  const app = Consumer.create({
    queueUrl: config.sqs.probationEvents.queueUrl,
    handleMessageBatch: buildEventHandler(),
    sqs,
    pollingWaitTimeMs: 5000,
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
