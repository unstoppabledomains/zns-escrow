#!/usr/bin/env ts-node
import {bytes} from '@zilliqa-js/util'
import {Zilliqa} from '@zilliqa-js/zilliqa'
import {readFileSync} from 'fs'
import namehash from 'namicorn/lib/zns/namehash'
import {join} from 'path'
import ask from '../../src/util/ask'
import createTransaction from '../../src/util/createTransaction'
import sanitizeContractCode from '../../src/util/sanitizeContractCode'
import yargs = require('yargs')

export default async function main() {
  const version = bytes.pack(333, 1)
  const zilliqa = new Zilliqa('https://dev-api.zilliqa.com')
  const address = zilliqa.wallet.addByPrivateKey(yargs.argv.privateKey as any)
  zilliqa.wallet.setDefault(address)

  const init = [
    {vname: '_scilla_version', type: 'Uint32', value: '0'},
    {vname: 'initialOwner', type: 'ByStr20', value: address},
    {vname: 'rootNode', type: 'ByStr32', value: namehash('zil')},
  ]

  await ask('Continue?')

  await createTransaction(zilliqa, {
    version,
    gasLimit: 20000,
    data: init,
    code: sanitizeContractCode(
      readFileSync(join(__dirname, './registry.scilla'), 'utf8'),
    ),
  })

  process.exit()
}

main().catch(console.error)
