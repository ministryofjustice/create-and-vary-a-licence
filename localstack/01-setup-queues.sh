#!/usr/bin/env bash
set -e
export TERM=ansi
export AWS_ACCESS_KEY_ID=foo
export AWS_SECRET_ACCESS_KEY=bar
export AWS_DEFAULT_REGION=eu-west-2

aws --endpoint-url=http://localhost:4576 sqs create-queue --queue-name create_and_vary_a_licence_prison_events_queue
aws --endpoint-url=http://localhost:4576 sqs create-queue --queue-name create_and_vary_a_licence_prison_events_queue_dl
aws --endpoint-url=http://localhost:4576 sqs set-queue-attributes --queue-url "http://localhost:4576/queue/create_and_vary_a_licence_prison_events_queue" --attributes '{"RedrivePolicy":"{\"maxReceiveCount\":\"3\", \"deadLetterTargetArn\":\"arn:aws:sqs:eu-west-2:000000000000:create_and_vary_a_licence_prison_events_queue_dl\"}"}'

aws --endpoint-url=http://localhost:4576 sqs create-queue --queue-name create_and_vary_a_licence_probation_events_queue
aws --endpoint-url=http://localhost:4576 sqs create-queue --queue-name create_and_vary_a_licence_probation_events_queue_dl
aws --endpoint-url=http://localhost:4576 sqs set-queue-attributes --queue-url "http://localhost:4576/queue/create_and_vary_a_licence_probation_events_queue" --attributes '{"RedrivePolicy":"{\"maxReceiveCount\":\"3\", \"deadLetterTargetArn\":\"arn:aws:sqs:eu-west-2:000000000000:create_and_vary_a_licence_probation_events_queue_dl\"}"}'

echo Queue setup complete
