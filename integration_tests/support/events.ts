import * as AWS_SQS from '@aws-sdk/client-sqs'
import config from '../../server/config'

const { SQS } = AWS_SQS

const sqs = new SQS({
  region: 'eu-west-2',
  credentials: {
    accessKeyId: 'foo',
    secretAccessKey: 'bar',
  },
  endpoint: config.sqs.endpoint,
})

const sendMessage = (message: AWS_SQS.SendMessageCommandInput): void => {
  sqs.sendMessage(message, (err, data) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.log('Error', err)
    } else {
      // eslint-disable-next-line no-console
      console.log('Successfully added message', data.MessageId)
    }
  })
}

const purgeQueues = (): unknown => {
  sqs.purgeQueue(
    { QueueUrl: 'http://localhost:4566/000000000000/create_and_vary_a_licence_domain_events_queue' },
    err => {
      if (err) {
        // eslint-disable-next-line no-console
        console.log('Error', err)
      }
    },
  )
  sqs.purgeQueue(
    { QueueUrl: 'http://localhost:4566/000000000000/create_and_vary_a_licence_prison_events_queue' },
    err => {
      if (err) {
        // eslint-disable-next-line no-console
        console.log('Error', err)
      }
    },
  )
  sqs.purgeQueue(
    { QueueUrl: 'http://localhost:4566/000000000000/create_and_vary_a_licence_probation_events_queue' },
    err => {
      if (err) {
        // eslint-disable-next-line no-console
        console.log('Error', err)
      }
    },
  )
  return null
}

const sendDomainEvent = async (body: string): Promise<unknown> => {
  sendMessage({
    QueueUrl: 'http://localhost:4566/000000000000/create_and_vary_a_licence_domain_events_queue',
    MessageBody: body,
  })
  // Wait for the event listener to clear the queue
  await new Promise(resolve => {
    setTimeout(resolve, 10000)
  })
  return null
}

const sendPrisonEvent = async (body: string): Promise<unknown> => {
  sendMessage({
    QueueUrl: 'http://localhost:4566/000000000000/create_and_vary_a_licence_prison_events_queue',
    MessageBody: body,
  })
  // Wait for the event listener to clear the queue
  await new Promise(resolve => {
    setTimeout(resolve, 10000)
  })
  return null
}

export default { sendDomainEvent, sendPrisonEvent, purgeQueues }
