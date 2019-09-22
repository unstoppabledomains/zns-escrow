import {toBech32Address} from '@zilliqa-js/crypto'
import {BN, Long} from '@zilliqa-js/util'
import {Zilliqa} from '@zilliqa-js/zilliqa'
import {addToHistory} from './addToHistory'
import error from './error'
import sanitizeContractCode from './sanitizeContractCode'
import zilliqaRpcWrap from './zilliqaRpcWrap'

export default async function createTransaction(
  zilliqa: Zilliqa,
  {
    version,
    gasLimit,
    toAddr = '0x0000000000000000000000000000000000000000',
    code,
    amount = 0,
    data,
  }: {
    version: number
    gasLimit: number | string
    toAddr?: string
    code?: string
    amount?: number | string
    data: any
  },
) {
  const balance = await zilliqaRpcWrap(
    zilliqa.blockchain.getBalance(
      zilliqa.wallet.defaultAccount!.address.replace(/^0x/, '').toLowerCase(),
    ),
  )

  if (balance.balance < Number(gasLimit) * 10 ** 9 + Number(amount)) {
    error('not enough balance')
  }

  const signed = await zilliqa.wallet.sign(
    zilliqa.transactions.new(
      {
        version,
        gasPrice: new BN(10 ** 9),
        gasLimit: Long.fromValue(gasLimit),
        nonce: balance.nonce + 1,
        pubKey: zilliqa.wallet.defaultAccount!.publicKey,
        toAddr,
        code: code ? sanitizeContractCode(code) : undefined,
        amount: new BN(amount),
        data: typeof data === 'string' ? data : JSON.stringify(data),
      },
      true,
    ),
  )

  console.log(
    'Signed:',
    JSON.stringify(
      {
        ...signed.txParams,
        code: signed.txParams.code
          ? signed.txParams.code.slice(0, 16) +
            '...' +
            signed.txParams.code.match(/\n(contract \w+)\s*\(/)![1].trim() +
            '(...)...' +
            signed.txParams.code.slice(-16)
          : undefined,
        data: signed.txParams.data
          ? JSON.parse(signed.txParams.data)
          : undefined,
        amount: signed.txParams.amount.toString(),
        gasPrice: signed.txParams.gasPrice.toString(),
        gasLimit: signed.txParams.gasLimit.toString(),
      },
      null,
      2,
    ),
  )
  console.log('Broadcasting...')

  const tx = await zilliqa.blockchain.createTransaction(signed, 30, 20, true)

  console.log('Done!')

  if (tx.isRejected()) {
    console.error(
      'tx',
      JSON.stringify({id: tx.id, ...tx.txParams.receipt}, null, 2),
    )
    error('transaction was rejected')
  }

  if (signed.txParams.toAddr === '0x0000000000000000000000000000000000000000') {
    console.log()

    const address = toBech32Address(
      await zilliqaRpcWrap(
        zilliqa.blockchain.getContractAddressFromTransactionID(tx.id!),
      ),
    )

    console.log('Deployed contract at:', address)

    addToHistory({message: `Deployed escrow at '${address}'`})

    console.log()
  }

  if (version === 65537) {
    console.log('Check out:', 'https://viewblock.io/zilliqa/tx/' + tx.id)
  } else if (version === 21823489) {
    console.log(
      'Check out:',
      `https://viewblock.io/zilliqa/tx/${tx.id}?network=testnet`,
    )
  } else {
    console.log('Check out:', tx.id)
  }

  return tx
}
