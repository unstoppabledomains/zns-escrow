#!/usr/bin/env node
console.log(
  require('@zilliqa-js/crypto').getAddressFromPrivateKey(process.argv[2]),
)
