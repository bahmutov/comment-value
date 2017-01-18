#!/usr/bin/env bash

# when in NPM global bin folder
# find the path to the actual file with require hook
BASEDIR=$(dirname "$0")
module=$BASEDIR/../lib/node_modules/comment-value
node -r $module $@
