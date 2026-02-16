#!/bin/sh
# This script is used to create an .env file to allow us to set env vars
#
set -e

fileToAddVars='.env'
rm -f $fileToAddVars 2> /dev/null

# Match with the credentials set in docker-compose.yml
echo "Get SYSTEM_CLIENT_ID"
export SYSTEM_CLIENT_ID
SYSTEM_CLIENT_ID=$(kubectl -n create-and-vary-a-licence-dev get secrets create-and-vary-a-licence -o json | jq -r '.data.SYSTEM_CLIENT_ID | @base64d')

echo "Get SYSTEM_CLIENT_SECRET"
export SYSTEM_CLIENT_SECRET
SYSTEM_CLIENT_SECRET=$(kubectl -n create-and-vary-a-licence-dev get secrets create-and-vary-a-licence -o json | jq -r '.data.SYSTEM_CLIENT_SECRET | @base64d')

echo "Get API_CLIENT_ID"
export API_CLIENT_ID
API_CLIENT_ID=$(kubectl -n create-and-vary-a-licence-dev get secrets create-and-vary-a-licence -o json | jq -r '.data.API_CLIENT_ID | @base64d')

echo "Get API_CLIENT_SECRET"
export API_CLIENT_SECRET
API_CLIENT_SECRET=$(kubectl -n create-and-vary-a-licence-dev get secrets create-and-vary-a-licence -o json | jq -r '.data.API_CLIENT_SECRET | @base64d')

# Provide other env vars
export HMPPS_AUTH_URL=https://sign-in-dev.hmpps.service.justice.gov.uk/auth
export TOKEN_VERIFICATION_API_URL=https://token-verification-api-dev.prison.service.justice.gov.uk
export LICENCE_API_URL=http://localhost:8089
export PROBATION_SEARCH_API_URL=https://cvl-probation-mock.hmpps.service.justice.gov.uk
export COMMUNITY_API_URL=https://cvl-probation-mock.hmpps.service.justice.gov.uk
export PRISON_API_URL=https://prison-api-dev.prison.service.justice.gov.uk
export PRISONER_SEARCH_API_URL=https://prisoner-search-dev.prison.service.justice.gov.uk
export DELIUS_API_URL=https://cvl-probation-mock.hmpps.service.justice.gov.uk
export PRISON_REGISTER_API_URL=https://prison-register-dev.hmpps.service.justice.gov.uk
export GOTENBERG_API_URL=http://localhost:3002
export FRIDAY_RELEASE_POLICY=https://www.gov.uk/government/publications/discretionary-fridaypre-bank-holiday-release-scheme-policy-framework
export COMPONENT_API_URL=https://frontend-components-dev.hmpps.service.justice.gov.uk
export MANAGE_USERS_API_URL=https://manage-users-api-dev.hmpps.service.justice.gov.uk
export DPS_URL=https://digital-dev.prison.service.justice.gov.uk

export LICENCE_WATERMARK=true
export POSTCODE_LOOKUP_ENABLED=true
export COMMON_COMPONENTS_ENABLED=false
export SHOW_WHATS_NEW_BANNER=false
export HDC_ENABLED=true

export REDIS_HOST=localhost
export AWS_ACCESS_KEY_ID=foo
export AWS_SECRET_ACCESS_KEY=bar
export SERVICE_NAME=create-and-vary-a-licence

# Write to .env grouped by value type
cat <<EOF > $fileToAddVars
# === Dynamic secrets ===
  SYSTEM_CLIENT_ID=$SYSTEM_CLIENT_ID
  SYSTEM_CLIENT_SECRET=$SYSTEM_CLIENT_SECRET
  API_CLIENT_ID=$API_CLIENT_ID
  API_CLIENT_SECRET=$API_CLIENT_SECRET

# === URLs ===
  HMPPS_AUTH_URL=$HMPPS_AUTH_URL
  TOKEN_VERIFICATION_API_URL=$TOKEN_VERIFICATION_API_URL
  LICENCE_API_URL=$LICENCE_API_URL
  PROBATION_SEARCH_API_URL=$PROBATION_SEARCH_API_URL
  COMMUNITY_API_URL=$COMMUNITY_API_URL
  PRISON_API_URL=$PRISON_API_URL
  PRISONER_SEARCH_API_URL=$PRISONER_SEARCH_API_URL
  DELIUS_API_URL=$DELIUS_API_URL
  PRISON_REGISTER_API_URL=$PRISON_REGISTER_API_URL
  GOTENBERG_API_URL=$GOTENBERG_API_URL
  FRIDAY_RELEASE_POLICY=$FRIDAY_RELEASE_POLICY
  COMPONENT_API_URL=$COMPONENT_API_URL
  MANAGE_USERS_API_URL=$MANAGE_USERS_API_URL
  DPS_URL=$DPS_URL

# === Boolean flags ===
  LICENCE_WATERMARK=$LICENCE_WATERMARK
  POSTCODE_LOOKUP_ENABLED=$POSTCODE_LOOKUP_ENABLED
  COMMON_COMPONENTS_ENABLED=$COMMON_COMPONENTS_ENABLED
  SHOW_WHATS_NEW_BANNER=$SHOW_WHATS_NEW_BANNER
  HDC_ENABLED=$HDC_ENABLED

# === Static strings and misc ===
  REDIS_HOST=$REDIS_HOST
  AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
  AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
  SERVICE_NAME=$SERVICE_NAME
EOF

echo ".env file created successfully."
