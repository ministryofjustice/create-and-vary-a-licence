import AWS from 'aws-sdk'
import { Consumer } from 'sqs-consumer'
import config from '../config'
import logger from '../../logger'
import buildEventHandler from './eventHandlers/prisonEvents'
import { Services } from '../services'

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
    pollingWaitTimeMs: 300000,
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
