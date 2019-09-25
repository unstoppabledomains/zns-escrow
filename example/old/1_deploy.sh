#!/usr/bin/env sh

set -e

dir=$(dirname $0)

NODE_ENV=development zns-escrow deploy another.zil \
  --chain-id 333 \
  --private-key $(cat $dir/seller.key) \
  --buyer $($dir/pkToAddress.js $(cat $dir/buyer.key)) \
  --price 10 --qa \
  --registry $(cat $dir/registry/address.txt)
