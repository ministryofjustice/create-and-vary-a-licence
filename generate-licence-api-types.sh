#!/bin/bash 

OUTPUT_FILE=server/@types/licenceApiImport/index.d.ts
SWAGGER_ENDPOINT=/v3/api-docs

if [[ $1 == "--local" ]]; then
  npx openapi-typescript "http://localhost:8089$SWAGGER_ENDPOINT" > "$OUTPUT_FILE"
else
  npx openapi-typescript "https://create-and-vary-a-licence-api-dev.hmpps.service.justice.gov.uk$SWAGGER_ENDPOINT" > "$OUTPUT_FILE"
fi
