#!/bin/bash
#
# Script to compile the SASS modules and output the stylesheets
#

# Build the application stylesheet
./node_modules/.bin/sass $@ \
     --load-path=. \
     --load-path=node_modules/govuk-frontend \
     --load-path=node_modules/@ministryofjustice/frontend \
     ./assets/sass/application.sass:./assets/stylesheets/application.css \
     ./assets/sass/application-ie8.sass:./assets/stylesheets/application-ie8.css \
     --style compressed

# Build the stylesheet for PDF licence documents
./node_modules/.bin/sass $@ \
    assets/sass/licence-pdf.sass \
    assets/stylesheets/licence-pdf.css

# End
