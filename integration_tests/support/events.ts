import AWS from 'aws-sdk'
import { SendMessageRequest } from 'aws-sdk/clients/sqs'

const sqs = new AWS.SQS({ region: 'eu-west-2' })

const sendMessage = (message: SendMessageRequest): unknown => {
  sqs.sendMessage(message, (err, data) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.log('Error', err)
    } else {
      // eslint-disable-next-line no-console
      console.log('Successfully added message', data.MessageId)
    }
  })
  return null
}

const sendDomainEvent = (body: string): unknown => {
  return sendMessage({
    QueueUrl: 'http://localhost:4576/queue/create_and_vary_a_licence_domain_events_queue',
    MessageBody: body,
  })
}

const sendPrisonEvent = (body: string): unknown => {
  return sendMessage({
    QueueUrl: 'http://localhost:4576/queue/create_and_vary_a_licence_prison_events_queue',
    MessageBody: body,
  })
}

const sendProbationEvent = (body: string): unknown => {
  return sendMessage({
    QueueUrl: 'http://localhost:4576/queue/create_and_vary_a_licence_probation_events_queue',
    MessageBody: body,
  })
}

export default { sendDomainEvent, sendPrisonEvent, sendProbationEvent }
