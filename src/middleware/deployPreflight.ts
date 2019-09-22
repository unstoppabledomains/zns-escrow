import {getAddressFromPrivateKey, normaliseAddress} from '@zilliqa-js/crypto'
import error from '../util/error'

type WithSeller<T extends {}> = T & {
  seller: string
  privateKey: string
}

export default function deployPreflight<
  T extends {
    buyer: string
    seller?: string
    privateKey?: string
    price: number
    qa?: boolean
  }
>(argv: T): WithSeller<T> {
  try {
    argv.buyer = normaliseAddress(argv.buyer)
  } catch (err) {
    error('bad buyer', true)
  }

  if (argv.seller) {
    try {
      argv.seller = normaliseAddress(argv.seller)
    } catch (err) {
      error('bad seller', true)
    }
  } else {
    argv.seller = normaliseAddress(getAddressFromPrivateKey(argv.privateKey!))
  }

  if (!Number.isInteger(argv.price) || argv.price < 1) {
    error('bad price, must be positive integer', true)
  }

  argv.price = argv.qa ? argv.price : argv.price * 10 ** 12

  return argv as any
}
