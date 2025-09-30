#!/bin/bash
#
# Executed via npx to add and configure library 
# 

set -euo pipefail

startStage() {
  printf "%s" "$1"
}

endStage() {
  printf "%s\n" "$1"
}

printError() {
  printf "\x1b[1;31m%s\x1b[0m\n" "$1"
}

endStage "Setting up hmpps npm script locker" 

startStage "  * Adding/overwriting .npmrc script"
printf "%s\n" \
     "# This provides sensible defaults, this can be customised if necessary and changes will not be overwritten" \
     "" \
     "# Prevent preinstall, install, postinstall scripts from running by default" \
     "ignore-scripts = true" \
     "" \
     "# Use exact versions in package.json when using npm install <pkg>" \
     "save-exact = true" \
     "" \
     "# Fail if trying to use incorrect version of npm" \
     "engine-strict = true" \
     "" \
     "# Show any output of scripts in the console " \
     "foreground-scripts = true" \
       > .npmrc
endStage "  ✅"


startStage "  * Adding set up script"
npm pkg set --silent scripts.setup="npm ci && node run hmpps-allow-scripts" 
endStage "  ✅"

# Could add this via the package which would make it easier to customise
   
# Also...
# * install actual hmpps-npm-script-locker package
# * add preinstall script which always fails if scripts are called as part of the npm lifecycle 
#     - pkg set --silent  scripts.preinstall:"echo \"Run npm run setup to install run allowed lifecycle scripts\" && exit 1", 
# * add default .allowed-scripts config

endStage "FIN!"



