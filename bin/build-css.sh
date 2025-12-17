#!/bin/sh
#
# Script to compile the SASS modules and output the stylesheets
#

# Build the application stylesheet
./node_modules/.bin/sass $@ \
     --load-path=. \
     --load-path=node_modules \
     --load-path=node_modules/govuk-frontend/dist \
     --load-path=node_modules/@ministryofjustice/frontend \
     --load-path=node_modules/@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/all \
     ./assets/sass/application.sass:./assets/stylesheets/application.css \
     --style compressed

# Build the stylesheet for PDF licence documents
./node_modules/.bin/sass $@ \
    assets/sass/licence-pdf.sass \
    assets/stylesheets/licence-pdf.css

# End
