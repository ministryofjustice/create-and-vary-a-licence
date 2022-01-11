import AWS from 'aws-sdk'
import { Consumer } from 'sqs-consumer'
import config from '../config'
import logger from '../../logger'
import { Services } from '../services'
import buildEventHandler from './eventHandlers/prisonEvents'

const sqs = new AWS.SQS({
  region: 'eu-west-2',
  accessKeyId: config.sqs.prisonEvents.accessKeyId,
  secretAccessKey: config.sqs.prisonEvents.secretAccessKey,
})

export default function createSqsListener(services: Services) {
  const app = Consumer.create({
    queueUrl: config.sqs.prisonEvents.queueUrl,
    handleMessageBatch: buildEventHandler(services),
    sqs,
    pollingWaitTimeMs: 5000,
    batchSize: 10,
  })

  logger.info(`Consuming from queue ${config.sqs.prisonEvents.queueUrl}`)

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
