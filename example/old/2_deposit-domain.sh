#!/usr/bin/env sh

set -e

dir=$(dirname $0)

NODE_ENV=development zns-escrow deposit domain another.zil \
  --chain-id 333 \
  --private-key $(cat $dir/seller.key) \
  --escrow $(cat $dir/address.txt) \
  --registry $(cat $dir/registry/address.txt)
