import AWS from 'aws-sdk'
import { SendMessageRequest } from 'aws-sdk/clients/sqs'

const sqs = new AWS.SQS({
  region: 'eu-west-2',
  accessKeyId: 'foo',
  secretAccessKey: 'bar',
})

const sendMessage = (message: SendMessageRequest): void => {
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
  sqs.purgeQueue({ QueueUrl: 'http://localhost:4566/queue/create_and_vary_a_licence_domain_events_queue' }, err => {
    if (err) {
      // eslint-disable-next-line no-console
      console.log('Error', err)
    }
  })
  sqs.purgeQueue({ QueueUrl: 'http://localhost:4566/queue/create_and_vary_a_licence_prison_events_queue' }, err => {
    if (err) {
      // eslint-disable-next-line no-console
      console.log('Error', err)
    }
  })
  sqs.purgeQueue({ QueueUrl: 'http://localhost:4566/queue/create_and_vary_a_licence_probation_events_queue' }, err => {
    if (err) {
      // eslint-disable-next-line no-console
      console.log('Error', err)
    }
  })
  return null
}

const sendDomainEvent = async (body: string): Promise<unknown> => {
  sendMessage({
    QueueUrl: 'http://localhost:4566/queue/create_and_vary_a_licence_domain_events_queue',
    MessageBody: body,
  })
  // Wait for the event listener to clear the queue
  await new Promise(resolve => setTimeout(resolve, 10000))
  return null
}

const sendPrisonEvent = async (body: string): Promise<unknown> => {
  sendMessage({
    QueueUrl: 'http://localhost:4566/queue/create_and_vary_a_licence_prison_events_queue',
    MessageBody: body,
  })
  // Wait for the event listener to clear the queue
  await new Promise(resolve => setTimeout(resolve, 10000))
  return null
}

const sendProbationEvent = async (body: string): Promise<unknown> => {
  sendMessage({
    QueueUrl: 'http://localhost:4566/queue/create_and_vary_a_licence_probation_events_queue',
    MessageBody: body,
  })
  // Wait for the event listener to clear the queue
  await new Promise(resolve => setTimeout(resolve, 10000))
  return null
}

export default { sendDomainEvent, sendPrisonEvent, sendProbationEvent, purgeQueues }
