#!/bin/bash 

OUTPUT_FILE=server/@types/licenceApiImport/index.d.ts
SWAGGER_ENDPOINT=/v3/api-docs

if [[ $1 == "--local" ]]; then
    npx openapi-typescript "http://localhost:8089$SWAGGER_ENDPOINT" \
      | npx prettier --parser typescript --single-quote \
      > "$OUTPUT_FILE"
else
    npx openapi-typescript "https://create-and-vary-a-licence-api-dev.hmpps.service.justice.gov.uk$SWAGGER_ENDPOINT" \
      | npx prettier --parser typescript --single-quote \
      > "$OUTPUT_FILE"
fi

# Embedded JavaScript to clean duplicate json adjacent structures entries e.g.
# } & {
#  /**
#   * @description discriminator enum property added by openapi-typescript
#   * @enum {string}
#   */
#  kind: 'VARIATION'
#} & {
#  /**
#   * @description discriminator enum property added by openapi-typescript
#   * @enum {string}
#   */
#  kind: 'VARIATION'
#}
node - <<EOF
  const fs = require('fs');

  const file = '$OUTPUT_FILE';
  const input = fs.readFileSync(file, 'utf-8');

  // The regex finds this exact pattern — two adjacent structures where the second has the same as the first — and removes the second.
  const cleanedFileWithOutDuplicates = input.replace(/(&\s*\{[\s\S]*?\})\s*\1/g,'\$1');

  fs.writeFileSync(file, cleanedFileWithOutDuplicates);
  console.log('Cleaned duplicate json entries in $OUTPUT_FILE');
EOF
