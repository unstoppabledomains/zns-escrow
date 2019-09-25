#!/usr/bin/env sh

set -e

dir=$(dirname $0)

$dir/deploy.ts \
  --private-key $(cat $dir/../seller.key)
