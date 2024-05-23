#!/bin/bash

read -r -p "Please enter the prisoner number: " PRISONER_NUMBER

if [ -z "$PRISONER_NUMBER" ]
then
  echo "No prisoner number specified."
  exit 99
fi

read -r -p "Please enter the prison code: " PRISONER_CODE

if [ -z "$PRISONER_CODE" ]
then
  echo "No prison code specified."
  exit 99
fi

aws --region=eu-west-2 --endpoint-url=http://localhost:4566 sns publish --topic-arn arn:aws:sns:eu-west-2:000000000000:domainevents-topic --message '{"eventType":"prisoner-offender-search.prisoner.released","version":"1.0","occurredAt":"2020-02-12T15:14:24.125533+00:00", "publishedAt":"2020-02-12T15:15:09.902048716+00:00","description":"A prisoner has been released from prison", "additionalInformation":{"nomsNumber":"'"$PRISONER_NUMBER"'", "prisonId":"'"$PRISONER_CODE"'","reason":"RELEASED", "details":"Recall referral date 2021-05-12"}}' --message-attributes '{"eventType":{"DataType":"String","StringValue":"prison-offender-events.prisoner.released"}}'
