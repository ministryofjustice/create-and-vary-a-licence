#!/bin/bash

set -e -o pipefail

usage() {
  cat <<USAGE
Usage: $0 <target>... [--local]

Targets:
  licence                  create-and-vary-a-licence-api
  delius                   create-and-vary-a-licence-and-delius
  prison                   prison-api
  prison-register          prison-register
  prisoner-offender-search prisoner-offender-search
  all                      all of the above

Options:
  --local                  (licence only) generate from API running on localhost:8089
USAGE
  exit 1
}

SWAGGER_ENDPOINT=/v3/api-docs

generate() {
  local url=$1 dir=$2
  npx @hey-api/openapi-ts -i "$url$SWAGGER_ENDPOINT" -o "./server/@types/$dir" -p @hey-api/typescript \
    && npx eslint . --cache --max-warnings 0 --fix "./server/@types/$dir/types.gen.ts"
}

generate_licence() {
  if [[ $LOCAL == true ]]; then
    generate http://localhost:8089 licenceApiImport
  else
    generate https://create-and-vary-a-licence-api-dev.hmpps.service.justice.gov.uk licenceApiImport
  fi
}

TARGETS=()
LOCAL=false
for arg in "$@"; do
  case $arg in
    --local) LOCAL=true ;;
    licence|delius|prison|prison-register|prisoner-offender-search) TARGETS+=("$arg") ;;
    all) TARGETS+=(licence delius prison prison-register prisoner-offender-search) ;;
    *) usage ;;
  esac
done

[[ ${#TARGETS[@]} -eq 0 ]] && usage
if [[ $LOCAL == true && " ${TARGETS[*]} " != *" licence "* ]]; then
  echo "--local is only supported for the licence target" >&2
  exit 1
fi

for target in "${TARGETS[@]}"; do
  case $target in
    licence) generate_licence ;;
    delius) generate https://create-and-vary-a-licence-and-delius-dev.hmpps.service.justice.gov.uk deliusApiImport ;;
    prison) generate https://prison-api-dev.prison.service.justice.gov.uk prisonApiImport ;;
    prison-register) generate https://prison-register-dev.hmpps.service.justice.gov.uk prisonRegisterApiImport ;;
    prisoner-offender-search) generate https://prisoner-search-dev.prison.service.justice.gov.uk prisonerOffenderSearchImport ;;
  esac
done
