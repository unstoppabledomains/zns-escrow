#!/usr/bin/env sh

set -e

dir=$(dirname $0)

$dir/bestow.ts \
  --private-key $(cat $dir/../seller.key) \
  --registry $(cat $dir/address.txt) \
  --domain $1
