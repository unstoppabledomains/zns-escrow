#!/usr/bin/env sh

set -e

dir=$(dirname $0)

ts-node deploy.ts --private-key $(cat $dir/../seller.key)
