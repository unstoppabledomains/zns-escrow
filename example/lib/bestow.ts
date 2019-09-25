#!/usr/bin/env ts-node
import {bytes} from '@zilliqa-js/util'
import {Zilliqa} from '@zilliqa-js/zilliqa'
import ask from '../../src/util/ask'
import createTransaction from '../../src/util/createTransaction'
import yargs = require('yargs')

export default async function main() {
  const version = bytes.pack(333, 1)
  const zilliqa = new Zilliqa('https://dev-api.zilliqa.com')
  const address = zilliqa.wallet.addByPrivateKey(yargs.argv.privateKey as any)
  zilliqa.wallet.setDefault(address)

  const message = {
    _tag: 'bestow',
    params: [
      {vname: 'owner', type: 'ByStr20', value: address},
      {
        vname: 'resolver',
        type: 'ByStr20',
        value: '0x0000000000000000000000000000000000000000',
      },
      {vname: 'label', type: 'String', value: yargs.argv.domain},
    ],
  }

  await ask('Continue?')

  await createTransaction(zilliqa, {
    version,
    gasLimit: 5000,
    toAddr: yargs.argv.registry as any,
    data: JSON.stringify(message),
  })

  process.exit()
}

main().catch(console.error)
